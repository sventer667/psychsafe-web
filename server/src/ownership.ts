import { db } from './db.js'

/** Confirms the given case belongs to the org, to stop cross-tenant access via a spoofed caseId. */
export function ownsCase(orgId: number, caseId: number | string): boolean {
  const row = db.prepare('SELECT id FROM cases WHERE id = ? AND orgId = ?').get(caseId, orgId)
  return !!row
}

/**
 * True once a case has been closed and sealed. Enforced here (not just hidden
 * in the UI) so hazards/action items/consultations are actually read-only
 * once sealed, not just presented that way, closing the gap where a direct
 * API call could edit a "sealed" record's contents.
 */
export function isCaseClosed(caseId: number | string): boolean {
  const row = db.prepare('SELECT status FROM cases WHERE id = ?').get(caseId) as { status: string } | undefined
  return row?.status === 'closed'
}
