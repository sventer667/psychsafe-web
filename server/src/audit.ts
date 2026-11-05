import type { Request } from 'express'
import { db } from './db.js'
import { clientIp } from './sessions.js'

// Records who did what in an organisation. Never throws: a failure to write the
// audit trail must not break the action being audited.
export function logAudit(
  orgId: number,
  userId: number | null,
  action: string,
  detail = '',
  req?: Request
): void {
  try {
    const user = userId
      ? (db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as { name: string } | undefined)
      : undefined
    db.prepare('INSERT INTO audit_log (orgId, userId, userName, action, detail, ip) VALUES (?, ?, ?, ?, ?, ?)').run(
      orgId,
      userId,
      user?.name ?? '',
      action,
      detail.slice(0, 500),
      req ? clientIp(req) : ''
    )
  } catch (err) {
    console.error('[audit] failed to record', action, err)
  }
}
