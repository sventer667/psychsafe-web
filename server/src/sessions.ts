import crypto from 'node:crypto'
import type { Request } from 'express'
import { db } from './db.js'
import { signToken } from './auth.js'
import { sendEmail } from './email.js'
import { logAudit } from './audit.js'

// Server-side sessions. Every login creates a row in `sessions` and the signed
// token carries that row's id (`sid`). requireAuth rejects any token whose
// session row no longer exists, so a session can be ended from the server
// (by the limit below, by "sign out other devices", or by logout) even though
// the token itself is a stateless JWT.

// How many sign-ins one account can have active at once. A new login beyond
// this signs out the least recently used one.
export const MAX_SESSIONS_PER_USER = 2

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // matches the JWT's 7 day expiry

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}

export function clientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for']
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim()
  return (first || req.socket.remoteAddress || '').replace(/^::ffff:/, '').slice(0, 64)
}

// Browser + operating system only (not versions), so a routine browser update
// doesn't make a known device look new.
export function describeDevice(ua: string): { label: string; key: string } {
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Unknown browser'
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /iPhone|iPad|iPod/.test(ua)
      ? 'iOS'
      : /Android/.test(ua)
        ? 'Android'
        : /Mac OS X|Macintosh/.test(ua)
          ? 'macOS'
          : /CrOS/.test(ua)
            ? 'ChromeOS'
            : /Linux/.test(ua)
              ? 'Linux'
              : 'Unknown system'
  return { label: `${browser} on ${os}`, key: `${browser}|${os}` }
}

type SessionUser = { id: number; orgId: number; name: string; email: string }

async function sendNewDeviceEmail(user: SessionUser, label: string, ip: string, when: Date): Promise<void> {
  const appUrl = (process.env.APP_URL || process.env.CLIENT_URL || 'https://humanora.com.au').replace(/\/$/, '')
  const time = when.toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'medium', timeStyle: 'short' })
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a2433">
<h2 style="margin:0 0 12px">New sign-in to your account</h2>
<p>Hi ${esc(user.name)},</p>
<p>Your Humanora account was just signed in to from a device we haven't seen before.</p>
<table cellpadding="6" style="background:#f4f6f8;border-radius:8px;margin:12px 0">
<tr><td><strong>Device</strong></td><td>${esc(label)}</td></tr>
<tr><td><strong>IP address</strong></td><td>${esc(ip || 'Unknown')}</td></tr>
<tr><td><strong>Time</strong></td><td>${esc(time)} (Sydney time)</td></tr>
</table>
<p>If this was you, no action is needed.</p>
<p>If it wasn't you, sign in at <a href="${appUrl}/security">${appUrl}/security</a>, use "Sign out other devices", and email <a href="mailto:contact@humanora.com.au">contact@humanora.com.au</a> straight away.</p>
<p style="color:#6b7686;font-size:12px">Humanora, ABN 80 423 515 887</p>
</div>`
  await sendEmail({ to: user.email, subject: 'New sign-in to your Humanora account', html })
}

// Creates a session for a completed login, enforces the per-user limit, sends
// a new-device email when appropriate, and returns the signed token.
// notifyNewDevice is false for account creation (the first device is expected).
export function startSession(user: SessionUser, req: Request, opts: { notifyNewDevice: boolean }): string {
  const ua = String(req.headers['user-agent'] || '').slice(0, 300)
  const ip = clientIp(req)
  const { label, key } = describeDevice(ua)
  const now = new Date()

  // Sessions older than the token lifetime can no longer be used anyway.
  db.prepare('DELETE FROM sessions WHERE userId = ? AND createdAt < ?').run(
    user.id,
    new Date(now.getTime() - SESSION_TTL_MS).toISOString()
  )

  const sid = crypto.randomBytes(16).toString('hex')
  db.prepare(
    'INSERT INTO sessions (id, userId, createdAt, lastSeenAt, ip, userAgent, deviceLabel) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(sid, user.id, now.toISOString(), now.toISOString(), ip, ua, label)

  // Keep only the most recently active sessions; the one just created is the newest.
  const surplus = db
    .prepare('SELECT id FROM sessions WHERE userId = ? ORDER BY lastSeenAt DESC, createdAt DESC LIMIT -1 OFFSET ?')
    .all(user.id, MAX_SESSIONS_PER_USER) as { id: string }[]
  for (const s of surplus) db.prepare('DELETE FROM sessions WHERE id = ?').run(s.id)

  // New-device detection. The very first device we see for an account (a fresh
  // signup, or the first login after this feature shipped) is recorded silently.
  const deviceHash = crypto.createHash('sha256').update(`${user.id}|${key}`).digest('hex')
  const known = db.prepare('SELECT id FROM known_devices WHERE userId = ? AND deviceHash = ?').get(user.id, deviceHash)
  if (!known) {
    const seen = db.prepare('SELECT COUNT(*) AS n FROM known_devices WHERE userId = ?').get(user.id) as { n: number }
    db.prepare('INSERT INTO known_devices (userId, deviceHash, deviceLabel, firstSeenAt) VALUES (?, ?, ?, ?)').run(
      user.id,
      deviceHash,
      label,
      now.toISOString()
    )
    if (opts.notifyNewDevice && seen.n > 0) {
      sendNewDeviceEmail(user, label, ip, now).catch((err) => console.error('[sessions] new-device email failed', err))
    }
  }

  logAudit(user.orgId, user.id, 'sign_in', label, req)
  return signToken({ userId: user.id, orgId: user.orgId, sid })
}
