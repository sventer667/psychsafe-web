import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import crypto from 'node:crypto'
import { logAudit } from '../audit.js'
import { seatLimitFor } from '../plans.js'
import { sendInviteEmail } from '../inviteEmail.js'

// Enterprise-only controls: audit log (view + CSV export), mandatory 2FA for
// everyone, and role management including a read-only "viewer" role.
export const enterpriseRouter = Router()
enterpriseRouter.use(requireAuth)

const ROLES = ['admin', 'member', 'viewer'] as const

function orgTier(orgId: number): string {
  const org = db.prepare('SELECT planTier, planStatus FROM organizations WHERE id = ?').get(orgId) as
    | { planTier: string; planStatus: string }
    | undefined
  // Enterprise features need a paid, current subscription.
  return org?.planStatus === 'active' ? org.planTier : 'starter'
}

function actor(req: AuthedRequest) {
  return db.prepare('SELECT role FROM users WHERE id = ?').get(req.auth!.userId) as { role: string } | undefined
}

// Every route below needs an admin, and most need the Enterprise plan.
enterpriseRouter.use((req: AuthedRequest, res, next) => {
  if (actor(req)?.role !== 'admin') return res.status(403).json({ error: 'Only admins can do this' })
  next()
})

function requireEnterprise(req: AuthedRequest, res: import('express').Response, next: import('express').NextFunction) {
  if (orgTier(req.auth!.orgId) !== 'enterprise') {
    return res.status(403).json({ error: 'This feature is part of the Enterprise plan.', code: 'ENTERPRISE_ONLY' })
  }
  next()
}

type AuditRow = { id: number; userName: string; action: string; detail: string; ip: string; createdAt: string }

enterpriseRouter.get('/audit', requireEnterprise, (req: AuthedRequest, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500)
  const before = Number(req.query.before) || Number.MAX_SAFE_INTEGER
  const rows = db
    .prepare('SELECT id, userName, action, detail, ip, createdAt FROM audit_log WHERE orgId = ? AND id < ? ORDER BY id DESC LIMIT ?')
    .all(req.auth!.orgId, before, limit) as AuditRow[]
  res.json({ rows })
})

const csv = (v: string | number) => `"${String(v).replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`

enterpriseRouter.get('/audit.csv', requireEnterprise, (req: AuthedRequest, res) => {
  const rows = db
    .prepare('SELECT id, userName, action, detail, ip, createdAt FROM audit_log WHERE orgId = ? ORDER BY id DESC LIMIT 50000')
    .all(req.auth!.orgId) as AuditRow[]
  logAudit(req.auth!.orgId, req.auth!.userId, 'audit_exported', `${rows.length} rows`, req)
  const lines = ['Time (UTC),User,Action,Detail,IP address']
  for (const r of rows) lines.push([r.createdAt, r.userName, r.action, r.detail, r.ip].map(csv).join(','))
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="humanora-audit-log.csv"')
  res.send(lines.join('\r\n'))
})

enterpriseRouter.get('/settings', (req: AuthedRequest, res) => {
  const org = db.prepare('SELECT require2fa FROM organizations WHERE id = ?').get(req.auth!.orgId) as { require2fa: number } | undefined
  res.json({ require2fa: !!org?.require2fa, enterprise: orgTier(req.auth!.orgId) === 'enterprise' })
})

enterpriseRouter.patch('/settings', requireEnterprise, (req: AuthedRequest, res) => {
  const { require2fa } = req.body as { require2fa?: boolean }
  if (typeof require2fa !== 'boolean') return res.status(400).json({ error: 'require2fa must be true or false' })
  db.prepare('UPDATE organizations SET require2fa = ? WHERE id = ?').run(require2fa ? 1 : 0, req.auth!.orgId)
  logAudit(req.auth!.orgId, req.auth!.userId, 'require_2fa_changed', require2fa ? 'Turned on for all users' : 'Turned off', req)
  res.json({ require2fa })
})

enterpriseRouter.patch('/users/:id/role', (req: AuthedRequest, res) => {
  const role = String((req.body as Record<string, unknown>)?.role ?? '')
  if (!ROLES.includes(role as (typeof ROLES)[number])) return res.status(400).json({ error: 'Invalid role' })
  if (role === 'viewer' && orgTier(req.auth!.orgId) !== 'enterprise') {
    return res.status(403).json({ error: 'The read-only viewer role is part of the Enterprise plan.', code: 'ENTERPRISE_ONLY' })
  }
  const target = db.prepare('SELECT id, name, role FROM users WHERE id = ? AND orgId = ?').get(req.params.id, req.auth!.orgId) as
    | { id: number; name: string; role: string }
    | undefined
  if (!target) return res.status(404).json({ error: 'User not found' })
  if (target.role === 'admin' && role !== 'admin') {
    const admins = (db.prepare("SELECT COUNT(*) AS n FROM users WHERE orgId = ? AND role = 'admin'").get(req.auth!.orgId) as { n: number }).n
    if (admins <= 1) return res.status(400).json({ error: 'There must be at least one admin' })
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, target.id)
  logAudit(req.auth!.orgId, req.auth!.userId, 'role_changed', `${target.name}: ${target.role} to ${role}`, req)
  res.json({ ok: true })
})

// --- Bulk import (CSV rows parsed in the browser, validated and saved here) ---
// Each endpoint takes { rows, commit }. With commit=false it only validates and
// reports problems; with commit=true it saves, but refuses if any row is invalid
// so a file is imported completely or not at all.

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']
const MAX_ROWS = 500
type RowError = { row: number; message: string }
const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

enterpriseRouter.post('/import/assessments', requireEnterprise, (req: AuthedRequest, res) => {
  const { rows, commit } = req.body as { rows?: Record<string, unknown>[]; commit?: boolean }
  if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: 'The file has no rows' })
  if (rows.length > MAX_ROWS) return res.status(400).json({ error: `Import up to ${MAX_ROWS} rows at a time` })

  const orgId = req.auth!.orgId
  const org = db.prepare('SELECT state FROM organizations WHERE id = ?').get(orgId) as { state: string | null } | undefined
  const existing = new Set(
    (db.prepare('SELECT name FROM cases WHERE orgId = ?').all(orgId) as { name: string }[]).map((c) => c.name.toLowerCase())
  )
  const seen = new Set<string>()
  const errors: RowError[] = []
  const clean: { name: string; state: string; scope: string }[] = []

  rows.forEach((r, i) => {
    const row = i + 2 // spreadsheet row number, allowing for the header line
    const name = str(r.name, 200)
    const state = str(r.state, 3).toUpperCase() || org?.state || ''
    const scope = str(r.scope, 1000)
    if (!name) return errors.push({ row, message: 'Name is required' })
    if (state && !STATES.includes(state)) return errors.push({ row, message: `State "${state}" is not one of ${STATES.join(', ')}` })
    const key = name.toLowerCase()
    if (existing.has(key)) return errors.push({ row, message: `An assessment called "${name}" already exists` })
    if (seen.has(key)) return errors.push({ row, message: `"${name}" appears more than once in the file` })
    seen.add(key)
    clean.push({ name, state, scope })
  })

  if (!commit || errors.length > 0) return res.json({ valid: clean.length, errors, created: 0 })

  try {
    db.exec('BEGIN')
    const ins = db.prepare("INSERT INTO cases (orgId, name, state, scope, status) VALUES (?, ?, ?, ?, 'open')")
    for (const c of clean) ins.run(orgId, c.name, c.state, c.scope)
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    console.error('Assessment import failed', err)
    return res.status(500).json({ error: 'Import failed and nothing was saved' })
  }
  logAudit(orgId, req.auth!.userId, 'import_assessments', `${clean.length} assessments`, req)
  res.json({ valid: clean.length, errors: [], created: clean.length })
})

enterpriseRouter.post('/import/team', requireEnterprise, async (req: AuthedRequest, res) => {
  const { rows, commit } = req.body as { rows?: Record<string, unknown>[]; commit?: boolean }
  if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: 'The file has no rows' })
  if (rows.length > MAX_ROWS) return res.status(400).json({ error: `Import up to ${MAX_ROWS} rows at a time` })

  const orgId = req.auth!.orgId
  const used = (db.prepare('SELECT COUNT(*) AS n FROM users WHERE orgId = ?').get(orgId) as { n: number }).n +
    (db
      .prepare("SELECT COUNT(*) AS n FROM invites WHERE orgId = ? AND status = 'pending' AND expiresAt > datetime('now')")
      .get(orgId) as { n: number }).n
  const limit = seatLimitFor(orgTier(orgId))

  const seen = new Set<string>()
  const errors: RowError[] = []
  const clean: { name: string; email: string }[] = []
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  rows.forEach((r, i) => {
    const row = i + 2
    const name = str(r.name, 120)
    const email = str(r.email, 200).toLowerCase()
    if (!name) return errors.push({ row, message: 'Name is required' })
    if (!emailRe.test(email)) return errors.push({ row, message: `"${email}" is not a valid email address` })
    if (seen.has(email)) return errors.push({ row, message: `${email} appears more than once in the file` })
    seen.add(email)
    if (db.prepare('SELECT 1 FROM users WHERE lower(email) = ?').get(email))
      return errors.push({ row, message: `${email} already has an account` })
    if (db.prepare("SELECT 1 FROM invites WHERE orgId = ? AND lower(email) = ? AND status = 'pending' AND expiresAt > datetime('now')").get(orgId, email))
      return errors.push({ row, message: `${email} already has a pending invite` })
    clean.push({ name, email })
  })
  if (used + clean.length > limit) {
    errors.push({ row: 0, message: `This would use ${used + clean.length} seats but your plan allows ${limit} (${used} in use)` })
  }

  if (!commit || errors.length > 0) return res.json({ valid: clean.length, errors, created: 0, invites: [] })

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const invites: { name: string; email: string; token: string }[] = []
  try {
    db.exec('BEGIN')
    const ins = db.prepare('INSERT INTO invites (orgId, name, email, token, expiresAt) VALUES (?, ?, ?, ?, ?)')
    for (const c of clean) {
      const token = crypto.randomBytes(24).toString('hex')
      ins.run(orgId, c.name, c.email, token, expiresAt)
      invites.push({ ...c, token })
    }
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    console.error('Team import failed', err)
    return res.status(500).json({ error: 'Import failed and nothing was saved' })
  }
  logAudit(orgId, req.auth!.userId, 'import_team', `${invites.length} invites`, req)
  // Email each invitee. Failures don't undo the import; the link list can still be downloaded.
  const results = await Promise.all(
    invites.map((i) => sendInviteEmail({ orgId, inviterId: req.auth!.userId, name: i.name, email: i.email, token: i.token }))
  )
  res.json({ valid: clean.length, errors: [], created: invites.length, invites, emailed: results.filter(Boolean).length })
})
