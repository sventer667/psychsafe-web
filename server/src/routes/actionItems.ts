import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { ownsCase, isCaseClosed } from '../ownership.js'
import { requireTrialActive } from '../trialGate.js'

const SEALED_ERROR = { error: 'This assessment is sealed and cannot be edited' }

export const actionItemsRouter = Router()
actionItemsRouter.use(requireAuth)
actionItemsRouter.use(requireTrialActive)

const STATUSES = ['pending', 'in_progress', 'verification_pending', 'complete', 'closed'] as const

// Every action_items row carries both the legacy free-text ownerName (kept
// only so pre-migration rows still display something) and the real ownerId.
// Rows are always fetched with a LEFT JOIN to users so the display name
// reflects the actually-assigned team member, falling back to the legacy
// text only when there's no linked user at all.
const SELECT_WITH_OWNER = `
  SELECT
    action_items.id, action_items.caseId, action_items.hazardId, action_items.title,
    action_items.description, action_items.dueDate, action_items.status,
    action_items.createdAt, action_items.completedAt, action_items.ownerId,
    COALESCE(users.name, action_items.ownerName, '') as ownerName,
    users.email as ownerEmail
  FROM action_items
  LEFT JOIN users ON users.id = action_items.ownerId
`

function withOverdue<T extends { dueDate: string | null; status: string }>(item: T) {
  const isOverdue =
    !!item.dueDate &&
    !['complete', 'closed'].includes(item.status) &&
    new Date(item.dueDate) < new Date(new Date().toDateString())
  return { ...item, isOverdue }
}

// Confirms an ownerId, if provided, actually belongs to a user on this org,
// so an action can't be assigned to someone else's team member (or a
// nonexistent user id) just by passing an arbitrary number.
function validOwnerId(orgId: number, ownerId: unknown): number | null {
  if (ownerId === undefined || ownerId === null || ownerId === '') return null
  const id = Number(ownerId)
  const user = db.prepare('SELECT id FROM users WHERE id = ? AND orgId = ?').get(id, orgId)
  return user ? id : null
}

actionItemsRouter.get('/', (req: AuthedRequest, res) => {
  const caseId = Number(req.query.caseId)
  if (!caseId || !ownsCase(req.auth!.orgId, caseId)) {
    return res.status(403).json({ error: 'Not authorized for this assessment' })
  }
  const rows = db.prepare(`${SELECT_WITH_OWNER} WHERE action_items.caseId = ? ORDER BY action_items.dueDate ASC`).all(caseId) as any[]
  res.json(rows.map(withOverdue))
})

actionItemsRouter.post('/', (req: AuthedRequest, res) => {
  const { caseId, hazardId, title, description, ownerId, dueDate } = req.body as Record<string, any>
  if (!caseId || !ownsCase(req.auth!.orgId, caseId)) {
    return res.status(403).json({ error: 'Not authorized for this assessment' })
  }
  if (isCaseClosed(caseId)) return res.status(400).json(SEALED_ERROR)
  if (!title) return res.status(400).json({ error: 'Title is required' })
  if (ownerId !== undefined && ownerId !== '' && ownerId !== null && !validOwnerId(req.auth!.orgId, ownerId)) {
    return res.status(400).json({ error: 'Owner must be a member of your organisation' })
  }

  const result = db
    .prepare(
      'INSERT INTO action_items (caseId, hazardId, title, description, ownerId, dueDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(caseId, hazardId || null, title, description || '', validOwnerId(req.auth!.orgId, ownerId), dueDate || null, 'pending')

  res.json(withOverdue(db.prepare(`${SELECT_WITH_OWNER} WHERE action_items.id = ?`).get(result.lastInsertRowid) as any))
})

actionItemsRouter.patch('/:id', (req: AuthedRequest, res) => {
  const item = db.prepare('SELECT * FROM action_items WHERE id = ?').get(req.params.id) as { caseId: number } | undefined
  if (!item || !ownsCase(req.auth!.orgId, item.caseId)) {
    return res.status(404).json({ error: 'Action item not found' })
  }
  if (isCaseClosed(item.caseId)) return res.status(400).json(SEALED_ERROR)
  const { status, ownerId, dueDate } = req.body as Record<string, any>
  if (status) {
    if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    const completedAt = status === 'complete' || status === 'closed' ? "datetime('now')" : 'NULL'
    db.prepare(`UPDATE action_items SET status = ?, completedAt = ${completedAt} WHERE id = ?`).run(status, req.params.id)
  }
  if (ownerId !== undefined) {
    if (ownerId !== '' && ownerId !== null && !validOwnerId(req.auth!.orgId, ownerId)) {
      return res.status(400).json({ error: 'Owner must be a member of your organisation' })
    }
    db.prepare('UPDATE action_items SET ownerId = ? WHERE id = ?').run(validOwnerId(req.auth!.orgId, ownerId), req.params.id)
  }
  if (dueDate !== undefined) db.prepare('UPDATE action_items SET dueDate = ? WHERE id = ?').run(dueDate, req.params.id)

  res.json(withOverdue(db.prepare(`${SELECT_WITH_OWNER} WHERE action_items.id = ?`).get(req.params.id) as any))
})
