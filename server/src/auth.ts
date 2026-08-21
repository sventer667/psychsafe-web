import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export interface AuthPayload {
  userId: number
  orgId: number
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
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload & { pending2fa?: boolean }
    // A pending-2FA token is deliberately rejected here: it's only valid
    // against POST /auth/login/2fa, never against a real protected route.
    if (payload.pending2fa) {
      return res.status(401).json({ error: 'Two-factor verification required' })
    }
    req.auth = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
