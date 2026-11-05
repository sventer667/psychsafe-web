import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { db } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export interface AuthPayload {
  userId: number
  orgId: number
  // Id of the row in `sessions` this token belongs to. requireAuth rejects a
  // token whose session has been ended (see sessions.ts).
  sid?: string
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// A separate, short-lived, reduced-scope token type issued after a correct
// password but before a correct TOTP/backup code, when a user has two-factor
// enabled. It deliberately carries no orgId and a `pending2fa` marker so it
// can never be mistaken for (or upgraded into) a full session by requireAuth
// below, only the dedicated POST /auth/login/2fa endpoint accepts it.
export interface PendingTwoFactorPayload {
  userId: number
  pending2fa: true
}

export function signPendingTwoFactorToken(userId: number): string {
  return jwt.sign({ userId, pending2fa: true }, JWT_SECRET, { expiresIn: '5m' })
}

export function verifyPendingTwoFactorToken(token: string): PendingTwoFactorPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as Partial<PendingTwoFactorPayload>
    if (payload.pending2fa === true && typeof payload.userId === 'number') {
      return payload as PendingTwoFactorPayload
    }
    return null
  } catch {
    return null
  }
}

export interface AuthedRequest extends Request {
  auth?: AuthPayload
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' })
  }

  let payload: AuthPayload & { pending2fa?: boolean }
  try {
    payload = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload & { pending2fa?: boolean }
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'SESSION_ENDED' })
  }

  // A pending-2FA token is deliberately rejected here: it's only valid
  // against POST /auth/login/2fa, never against a real protected route.
  if (payload.pending2fa) {
    return res.status(401).json({ error: 'Two-factor verification required' })
  }

  // The token must belong to a live server-side session. Tokens issued before
  // sessions existed carry no sid and are treated as ended (one re-login).
  const session = payload.sid
    ? (db.prepare('SELECT id, lastSeenAt FROM sessions WHERE id = ? AND userId = ?').get(payload.sid, payload.userId) as
        | { id: string; lastSeenAt: string }
        | undefined)
    : undefined
  if (!session) {
    return res
      .status(401)
      .json({ error: 'You were signed out because this account signed in somewhere else.', code: 'SESSION_ENDED' })
  }

  // Record activity (at most once a minute) so "least recently used" is meaningful.
  if (Date.now() - Date.parse(session.lastSeenAt) > 60_000) {
    db.prepare('UPDATE sessions SET lastSeenAt = ? WHERE id = ?').run(new Date().toISOString(), session.id)
  }

  // Admin accounts must have two-factor authentication on. Until they do, the
  // only routes they can use are the /api/auth ones (so they can enrol).
  const user = db.prepare('SELECT role, totpEnabled FROM users WHERE id = ?').get(payload.userId) as
    | { role: string; totpEnabled: number }
    | undefined
  if (!user) {
    return res.status(401).json({ error: 'Account not found', code: 'SESSION_ENDED' })
  }
  const orgRow = db.prepare('SELECT require2fa FROM organizations WHERE id = ?').get(payload.orgId) as
    | { require2fa: number }
    | undefined
  const needs2fa = user.role === 'admin' || !!orgRow?.require2fa
  if (needs2fa && !user.totpEnabled && !req.originalUrl.startsWith('/api/auth/')) {
    return res.status(403).json({
      error: 'Two-factor authentication is required for your account. Set it up under Security.',
      code: '2FA_REQUIRED',
    })
  }

  // Viewers are read-only: anything that isn't a plain read is refused (the
  // /api/auth routes stay open so they can sign out and manage their devices).
  if (user.role === 'viewer' && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !req.originalUrl.startsWith('/api/auth/')) {
    return res.status(403).json({ error: 'Your account has read-only access.', code: 'READ_ONLY' })
  }

  req.auth = payload
  next()
}
