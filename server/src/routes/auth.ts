import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { db } from '../db.js'
import { requireAuth, signPendingTwoFactorToken, verifyPendingTwoFactorToken, type AuthedRequest } from '../auth.js'
import { startSession } from '../sessions.js'
import { passwordResetRouter } from '../passwordReset.js'

export const authRouter = Router()

const ORG_COLUMNS =
  'id, name, industry, state, businessUnit, planStatus, planTier, require2fa, trialEndsAt, stripeCustomerId, consultantName, consultantCredential, reviewFrequencyMonths'

const TRIAL_DAYS = 7

type UserRow = {
  id: number
  orgId: number
  name: string
  email: string
  passwordHash: string
  role: string
  totpSecret: string | null
  totpEnabled: number
  totpBackupCodes: string | null
}

function userResponse(u: { id: number; orgId: number; name: string; email: string; role: string; totpEnabled: number }) {
  return { id: u.id, name: u.name, email: u.email, orgId: u.orgId, role: u.role, totpEnabled: !!u.totpEnabled }
}

// Generates 8 one-time recovery codes for when a user loses their
// authenticator device. Returned in plaintext exactly once (at enable time);
// only bcrypt hashes are ever persisted, matching how passwords are stored.
function generateBackupCodes(): { plaintext: string[]; hashes: string[] } {
  const plaintext = Array.from({ length: 8 }, () => crypto.randomBytes(5).toString('hex').toUpperCase().match(/.{1,5}/g)!.join('-'))
  const hashes = plaintext.map((c) => bcrypt.hashSync(c, 10))
  return { plaintext, hashes }
}

function verifyAndConsumeBackupCode(user: UserRow, code: string): boolean {
  if (!user.totpBackupCodes) return false
  const hashes: string[] = JSON.parse(user.totpBackupCodes)
  const index = hashes.findIndex((h) => bcrypt.compareSync(code.trim(), h))
  if (index === -1) return false
  hashes.splice(index, 1)
  db.prepare('UPDATE users SET totpBackupCodes = ? WHERE id = ?').run(JSON.stringify(hashes), user.id)
  return true
}

authRouter.post('/register', (req, res) => {
  const { name, email, password, orgName } = req.body as Record<string, string>
  if (!name || !email || !password || !orgName) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' })
  }

  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const orgResult = db
    .prepare('INSERT INTO organizations (name, planStatus, trialEndsAt) VALUES (?, ?, ?)')
    .run(orgName, 'trialing', trialEndsAt)
  const orgId = Number(orgResult.lastInsertRowid)

  const passwordHash = bcrypt.hashSync(password, 10)
  const userResult = db
    .prepare('INSERT INTO users (orgId, name, email, passwordHash, role) VALUES (?, ?, ?, ?, ?)')
    .run(orgId, name, email, passwordHash, 'admin')
  const userId = Number(userResult.lastInsertRowid)

  const token = startSession({ id: userId, orgId, name, email }, req, { notifyNewDevice: false })
  const org = db.prepare(`SELECT ${ORG_COLUMNS} FROM organizations WHERE id = ?`).get(orgId)
  res.json({ token, user: { id: userId, name, email, orgId, role: 'admin', totpEnabled: false }, org })
})

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body as Record<string, string>
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  // A correct password is only the first factor for a user with 2FA
  // enabled: issue a short-lived, reduced-scope token and require a second
  // call to /login/2fa with a valid code before a real session is created.
  if (user.totpEnabled) {
    return res.json({ requiresTotp: true, pendingToken: signPendingTwoFactorToken(user.id), name: user.name })
  }

  const token = startSession(user, req, { notifyNewDevice: true })
  const org = db.prepare(`SELECT ${ORG_COLUMNS} FROM organizations WHERE id = ?`).get(user.orgId)
  res.json({ token, user: userResponse(user), org })
})

authRouter.post('/login/2fa', (req, res) => {
  const { pendingToken, code } = req.body as Record<string, string>
  const pending = pendingToken && verifyPendingTwoFactorToken(pendingToken)
  if (!pending) return res.status(401).json({ error: 'Your session has expired, please log in again' })

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(pending.userId) as UserRow | undefined
  if (!user || !user.totpEnabled || !user.totpSecret) {
    return res.status(401).json({ error: 'Two-factor authentication is not set up for this account' })
  }
  if (!code) return res.status(400).json({ error: 'Enter a code from your authenticator app' })

  const valid = authenticator.check(code.trim(), user.totpSecret) || verifyAndConsumeBackupCode(user, code)
  if (!valid) return res.status(401).json({ error: 'Incorrect or expired code' })

  const token = startSession(user, req, { notifyNewDevice: true })
  const org = db.prepare(`SELECT ${ORG_COLUMNS} FROM organizations WHERE id = ?`).get(user.orgId)
  res.json({ token, user: userResponse(user), org })
})

authRouter.get('/me', requireAuth, (req: AuthedRequest, res) => {
  const user = db
    .prepare('SELECT id, orgId, name, email, role, totpEnabled FROM users WHERE id = ?')
    .get(req.auth!.userId) as (UserRow & { totpEnabled: number }) | undefined
  const org = db.prepare(`SELECT ${ORG_COLUMNS} FROM organizations WHERE id = ?`).get(req.auth!.orgId)
  if (!user || !org) return res.status(404).json({ error: 'Account not found' })
  res.json({ user: userResponse(user), org })
})

// --- Signed-in devices (server-side sessions) ---
// Each login creates a session row (see sessions.ts). An account can hold at
// most MAX_SESSIONS_PER_USER at once; these routes let a user see and end them.

authRouter.post('/logout', requireAuth, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM sessions WHERE id = ? AND userId = ?').run(req.auth!.sid ?? '', req.auth!.userId)
  res.json({ ok: true })
})

authRouter.get('/sessions', requireAuth, (req: AuthedRequest, res) => {
  const rows = db
    .prepare('SELECT id, deviceLabel, ip, createdAt, lastSeenAt FROM sessions WHERE userId = ? ORDER BY lastSeenAt DESC')
    .all(req.auth!.userId) as { id: string; deviceLabel: string; ip: string; createdAt: string; lastSeenAt: string }[]
  res.json(rows.map((s) => ({ ...s, current: s.id === req.auth!.sid })))
})

authRouter.post('/sessions/revoke-others', requireAuth, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM sessions WHERE userId = ? AND id != ?').run(req.auth!.userId, req.auth!.sid ?? '')
  res.json({ ok: true })
})

authRouter.delete('/sessions/:id', requireAuth, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM sessions WHERE id = ? AND userId = ?').run(req.params.id, req.auth!.userId)
  res.json({ ok: true })
})

// --- Two-factor authentication (TOTP) ---
// Three-step enrollment: setup (generate + store a secret, not yet active)
// -> verify (prove the app is scanning it correctly, only then flips
// totpEnabled and issues backup codes) -> disable (password-gated, since
// turning off a security feature deserves the same friction as changing it).

authRouter.post('/2fa/setup', requireAuth, async (req: AuthedRequest, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.auth!.userId) as UserRow | undefined
  if (!user) return res.status(404).json({ error: 'Account not found' })
  if (user.totpEnabled) return res.status(400).json({ error: 'Two-factor authentication is already enabled' })

  const secret = authenticator.generateSecret()
  db.prepare('UPDATE users SET totpSecret = ? WHERE id = ?').run(secret, user.id)

  const otpauthUri = authenticator.keyuri(user.email, 'Humanora', secret)
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri)
    res.json({ secret, qrCodeDataUrl })
  } catch (err) {
    console.error('QR code generation failed', err)
    res.status(500).json({ error: 'Failed to generate QR code, you can still enter the secret manually' })
  }
})

authRouter.post('/2fa/verify', requireAuth, (req: AuthedRequest, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.auth!.userId) as UserRow | undefined
  if (!user) return res.status(404).json({ error: 'Account not found' })
  if (user.totpEnabled) return res.status(400).json({ error: 'Two-factor authentication is already enabled' })
  if (!user.totpSecret) return res.status(400).json({ error: 'Start setup before verifying a code' })

  const { code } = req.body as Record<string, string>
  if (!code || !authenticator.check(code.trim(), user.totpSecret)) {
    return res.status(400).json({ error: 'Incorrect code, check the time on your device and try again' })
  }

  const { plaintext, hashes } = generateBackupCodes()
  db.prepare('UPDATE users SET totpEnabled = 1, totpBackupCodes = ? WHERE id = ?').run(JSON.stringify(hashes), user.id)
  res.json({ ok: true, backupCodes: plaintext })
})

authRouter.post('/2fa/disable', requireAuth, (req: AuthedRequest, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.auth!.userId) as UserRow | undefined
  if (!user) return res.status(404).json({ error: 'Account not found' })

  if (user.role === 'admin') {
    return res.status(403).json({ error: 'Two-factor authentication is required for admin accounts and cannot be turned off.' })
  }

  const { password } = req.body as Record<string, string>
  if (!password || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

  db.prepare('UPDATE users SET totpSecret = NULL, totpEnabled = 0, totpBackupCodes = NULL WHERE id = ?').run(user.id)
  res.json({ ok: true })
})

// How often an org is expected to re-run a psychosocial risk assessment.
// Kept to a fixed, sane set of options rather than an arbitrary integer, so
// a typo can't silently set an org to "reassess every 1200 months".
const REVIEW_FREQUENCY_OPTIONS = [3, 6, 12, 24]

authRouter.patch('/org', requireAuth, (req: AuthedRequest, res) => {
  const { name, industry, state, businessUnit, consultantName, consultantCredential, planTier, reviewFrequencyMonths } =
    req.body as Record<string, string | number>
  // The plan tier is never set from here: it only changes through Stripe
  // (checkout / the billing webhook). Accepting it would let anyone self-upgrade.
  if (planTier !== undefined) {
    return res.status(400).json({ error: 'Change your plan from the Subscription page' })
  }
  if (reviewFrequencyMonths !== undefined && !REVIEW_FREQUENCY_OPTIONS.includes(Number(reviewFrequencyMonths))) {
    return res.status(400).json({ error: 'Invalid reassessment cadence' })
  }
  const fields: [string, string | number | undefined][] = [
    ['name', name],
    ['industry', industry],
    ['state', state],
    ['businessUnit', businessUnit],
    ['consultantName', consultantName],
    ['consultantCredential', consultantCredential],
    ['reviewFrequencyMonths', reviewFrequencyMonths !== undefined ? Number(reviewFrequencyMonths) : undefined],
  ]
  for (const [column, value] of fields) {
    if (value !== undefined) {
      db.prepare(`UPDATE organizations SET ${column} = ? WHERE id = ?`).run(value, req.auth!.orgId)
    }
  }
  const org = db.prepare(`SELECT ${ORG_COLUMNS} FROM organizations WHERE id = ?`).get(req.auth!.orgId)
  res.json(org)
})

authRouter.use(passwordResetRouter)
