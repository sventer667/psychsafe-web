import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { logAudit } from '../audit.js'

// Enterprise-only controls: audit log (view + CSV export), mandatory 2FA for
// everyone, and role management including a read-only "viewer" role.
export const enterpriseRouter = Router()
enterpriseRouter.use(requireAuth)

const ROLES = ['admin', 'member', 'viewer'] as const

function orgTier(orgId: number): string {
  return (db.prepare('SELECT planTier FROM organizations WHERE id = ?').get(orgId) as { planTier: string } | undefined)?.planTier ?? 'starter'
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
