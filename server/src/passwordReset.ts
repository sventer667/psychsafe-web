import crypto from 'node:crypto'
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from './db.js'
import { sendEmail } from './email.js'

// Password reset by emailed link. The emailed token is random and single use;
// only its SHA-256 hash is stored, so a database leak can't be used to reset
// accounts. Links expire after 1 hour. A reset also ends every signed-in
// session for the account. 2FA is unaffected: it is still required at sign-in.

db.exec(`
  CREATE TABLE IF NOT EXISTS password_resets (
    tokenHash TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    usedAt TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(userId);
`)

const TOKEN_TTL_MS = 60 * 60 * 1000
const MIN_GAP_MS = 60 * 1000 // at most one email per account per minute

const hash = (t: string) => crypto.createHash('sha256').update(t).digest('hex')

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}

export const passwordResetRouter = Router()

passwordResetRouter.post('/forgot-password', (req, res) => {
  const email = String((req.body as Record<string, unknown>)?.email ?? '').trim()
  // Same response whether or not the account exists, so it can't be used to
  // discover which emails have accounts.
  res.json({ ok: true })
  if (!email) return

  const user = db.prepare('SELECT id, name, email FROM users WHERE lower(email) = lower(?)').get(email) as
    | { id: number; name: string; email: string }
    | undefined
  if (!user) return

  const now = Date.now()
  const recent = db
    .prepare('SELECT createdAt FROM password_resets WHERE userId = ? ORDER BY createdAt DESC LIMIT 1')
    .get(user.id) as { createdAt: string } | undefined
  if (recent && now - Date.parse(recent.createdAt) < MIN_GAP_MS) return

  // Only the newest link works.
  db.prepare('DELETE FROM password_resets WHERE userId = ?').run(user.id)
  const token = crypto.randomBytes(32).toString('hex')
  db.prepare('INSERT INTO password_resets (tokenHash, userId, createdAt, expiresAt) VALUES (?, ?, ?, ?)').run(
    hash(token),
    user.id,
    new Date(now).toISOString(),
    new Date(now + TOKEN_TTL_MS).toISOString()
  )

  const appUrl = (process.env.APP_URL || process.env.CLIENT_URL || 'https://humanora.com.au').replace(/\/$/, '')
  const link = `${appUrl}/reset-password?token=${token}`
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a2433">
<h2 style="margin:0 0 12px">Reset your password</h2>
<p>Hi ${esc(user.name)},</p>
<p>We received a request to reset the password for your Humanora account. This link works once and expires in 1 hour.</p>
<p style="margin:20px 0"><a href="${link}" style="background:#0f7b64;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Choose a new password</a></p>
<p>If you didn't ask for this, you can ignore this email and your password will stay the same.</p>
<p style="color:#6b7686;font-size:12px">Humanora, ABN 80 423 515 887 · contact@humanora.com.au</p>
</div>`
  sendEmail({ to: user.email, subject: 'Reset your Humanora password', html }).catch((err) =>
    console.error('[password-reset] email failed', err)
  )
})

passwordResetRouter.post('/reset-password', (req, res) => {
  const { token, password } = req.body as Record<string, string>
  if (!token || !password) return res.status(400).json({ error: 'Token and new password are required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const row = db
    .prepare('SELECT tokenHash, userId, expiresAt, usedAt FROM password_resets WHERE tokenHash = ?')
    .get(hash(token)) as { tokenHash: string; userId: number; expiresAt: string; usedAt: string | null } | undefined
  if (!row || row.usedAt || Date.parse(row.expiresAt) < Date.now()) {
    return res.status(400).json({ error: 'This reset link is invalid or has expired. Request a new one.' })
  }

  db.prepare('UPDATE users SET passwordHash = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), row.userId)
  db.prepare('UPDATE password_resets SET usedAt = ? WHERE tokenHash = ?').run(new Date().toISOString(), row.tokenHash)
  db.prepare('DELETE FROM sessions WHERE userId = ?').run(row.userId)
  res.json({ ok: true })
})
