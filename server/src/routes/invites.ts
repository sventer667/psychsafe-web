import { Router } from 'express'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { db } from '../db.js'
import { signToken, requireAuth, type AuthedRequest } from '../auth.js'
import { seatLimitFor } from '../plans.js'
import { requireTrialActive, isTrialExpired } from '../trialGate.js'

export const invitesRouter = Router()

const ORG_COLUMNS =
  'id, name, industry, state, businessUnit, planStatus, planTier, stripeCustomerId, consultantName, consultantCredential'

const INVITE_TTL_DAYS = 7

function seatsUsed(orgId: number): number {
  const users = db.prepare('SELECT COUNT(*) as n FROM users WHERE orgId = ?').get(orgId) as { n: number }
  const pending = db
    .prepare("SELECT COUNT(*) as n FROM invites WHERE orgId = ? AND status = 'pending' AND expiresAt > datetime('now')")
    .get(orgId) as { n: number }
  return users.n + pending.n
}

// GET /api/team — everyone with access to this org, plus outstanding invites
// and how many of the org's plan seats are in use.
invitesRouter.get('/team', requireAuth, requireTrialActive, (req: AuthedRequest, res) => {
  const org = db.prepare('SELECT planTier FROM organizations WHERE id = ?').get(req.auth!.orgId) as
    | { planTier: string }
    | undefined
  const users = db
    .prepare('SELECT id, name, email, role, createdAt FROM users WHERE orgId = ? ORDER BY createdAt ASC')
    .all(req.auth!.orgId)
  const invites = db
    .prepare(
      "SELECT id, name, email, token, createdAt, expiresAt FROM invites WHERE orgId = ? AND status = 'pending' AND expiresAt > datetime('now') ORDER BY createdAt DESC"
    )
    .all(req.auth!.orgId)

  const seatLimit = seatLimitFor(org?.planTier || 'starter')
  res.json({ users, invites, seatLimit, seatsUsed: seatsUsed(req.auth!.orgId), planTier: org?.planTier || 'starter' })
})

// POST /api/invites — create a pending invite, subject to the org's seat limit.
invitesRouter.post('/invites', requireAuth, requireTrialActive, (req: AuthedRequest, res) => {
  const { name, email } = req.body as Record<string, string>
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' })

  const org = db.prepare('SELECT planTier FROM organizations WHERE id = ?').get(req.auth!.orgId) as
    | { planTier: string }
    | undefined
  const seatLimit = seatLimitFor(org?.planTier || 'starter')
  if (seatsUsed(req.auth!.orgId) >= seatLimit) {
    return res.status(400).json({ error: `Your plan is at its ${seatLimit}-seat limit. Upgrade your plan to add more people.` })
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existingUser) return res.status(409).json({ error: 'Someone with that email already has an account' })

  const existingInvite = db
    .prepare("SELECT id FROM invites WHERE orgId = ? AND email = ? AND status = 'pending' AND expiresAt > datetime('now')")
    .get(req.auth!.orgId, email)
  if (existingInvite) return res.status(409).json({ error: 'There is already a pending invite for that email' })

  const token = crypto.randomBytes(24).toString('hex')
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const result = db
    .prepare('INSERT INTO invites (orgId, name, email, token, expiresAt) VALUES (?, ?, ?, ?, ?)')
    .run(req.auth!.orgId, name, email, token, expiresAt)

  const invite = db.prepare('SELECT id, name, email, token, createdAt, expiresAt FROM invites WHERE id = ?').get(result.lastInsertRowid)
  res.json(invite)
})

// DELETE /api/invites/:id — revoke a pending invite.
invitesRouter.delete('/invites/:id', requireAuth, requireTrialActive, (req: AuthedRequest, res) => {
  const invite = db.prepare('SELECT id FROM invites WHERE id = ? AND orgId = ?').get(req.params.id, req.auth!.orgId)
  if (!invite) return res.status(404).json({ error: 'Invite not found' })
  db.prepare("UPDATE invites SET status = 'revoked' WHERE id = ?").run(req.params.id)
  res.json({ ok: true })
})

// GET /api/invites/token/:token — public lookup so the accept-invite page can
// show who's inviting them, without requiring auth.
invitesRouter.get('/invites/token/:token', (req, res) => {
  const invite = db
    .prepare("SELECT invites.name, invites.email, invites.expiresAt, invites.status, organizations.name as orgName FROM invites JOIN organizations ON organizations.id = invites.orgId WHERE token = ?")
    .get(req.params.token) as { name: string; email: string; expiresAt: string; status: string; orgName: string } | undefined

  if (!invite || invite.status !== 'pending' || new Date(invite.expiresAt) < new Date()) {
    return res.status(404).json({ error: 'This invite link is invalid or has expired' })
  }
  res.json({ name: invite.name, email: invite.email, orgName: invite.orgName })
})

// POST /api/invites/accept — public: redeem an invite by setting a password,
// creating the user, and logging them straight in.
invitesRouter.post('/invites/accept', (req, res) => {
  const { token, password } = req.body as Record<string, string>
  if (!token || !password) return res.status(400).json({ error: 'Missing token or password' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const invite = db.prepare('SELECT * FROM invites WHERE token = ?').get(token) as
    | { id: number; orgId: number; name: string; email: string; status: string; expiresAt: string }
    | undefined

  if (!invite || invite.status !== 'pending' || new Date(invite.expiresAt) < new Date()) {
    return res.status(404).json({ error: 'This invite link is invalid or has expired' })
  }

  const inviteOrg = db.prepare('SELECT planStatus, trialEndsAt FROM organizations WHERE id = ?').get(invite.orgId) as
    | { planStatus: string; trialEndsAt: string | null }
    | undefined
  if (inviteOrg && isTrialExpired(inviteOrg)) {
    return res.status(402).json({ error: "This organisation's trial has ended. Ask an admin to subscribe before inviting more people." })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(invite.email)
  if (existing) return res.status(409).json({ error: 'An account with that email already exists' })

  const seatLimit = seatLimitFor(
    (db.prepare('SELECT planTier FROM organizations WHERE id = ?').get(invite.orgId) as { planTier: string } | undefined)?.planTier ||
      'starter'
  )
  if (seatsUsed(invite.orgId) > seatLimit) {
    return res.status(400).json({ error: 'This organisation is at its seat limit. Ask an admin to free up a seat first.' })
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const userResult = db
    .prepare('INSERT INTO users (orgId, name, email, passwordHash, role) VALUES (?, ?, ?, ?, ?)')
    .run(invite.orgId, invite.name, invite.email, passwordHash, 'member')
  const userId = Number(userResult.lastInsertRowid)

  db.prepare("UPDATE invites SET status = 'accepted', acceptedAt = datetime('now') WHERE id = ?").run(invite.id)

  const jwtToken = signToken({ userId, orgId: invite.orgId })
  const org = db.prepare(`SELECT ${ORG_COLUMNS} FROM organizations WHERE id = ?`).get(invite.orgId)
  res.json({
    token: jwtToken,
    user: { id: userId, name: invite.name, email: invite.email, orgId: invite.orgId, role: 'member' },
    org,
  })
})
