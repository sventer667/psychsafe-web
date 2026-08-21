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

function withOverdue<T extends { dueDate: string | null; status: string }>(item: T) {
  const isOverdue =
    !!item.dueDate &&
    !['complete', 'closed'].includes(item.status) &&
    new Date(item.dueDate) < new Date(new Date().toDateString())
  return { ...item, isOverdue }
}

actionItemsRouter.get('/', (req: AuthedRequest, res) => {
  const caseId = Number(req.query.caseId)
  if (!caseId || !ownsCase(req.auth!.orgId, caseId)) {
    return res.status(403).json({ error: 'Not authorized for this assessment' })
  }
  const rows = db.prepare('SELECT * FROM action_items WHERE caseId = ? ORDER BY dueDate ASC').all(caseId) as any[]
  res.json(rows.map(withOverdue))
})

actionItemsRouter.post('/', (req: AuthedRequest, res) => {
  const { caseId, hazardId, title, description, ownerName, dueDate } = req.body as Record<string, any>
  if (!caseId || !ownsCase(req.auth!.orgId, caseId)) {
    return res.status(403).json({ error: 'Not authorized for this assessment' })
  }
  if (isCaseClosed(caseId)) return res.status(400).json(SEALED_ERROR)
  if (!title) return res.status(400).json({ error: 'Title is required' })

  const result = db
    .prepare(
      'INSERT INTO action_items (caseId, hazardId, title, description, ownerName, dueDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(caseId, hazardId || null, title, description || '', ownerName || '', dueDate || null, 'pending')

  res.json(withOverdue(db.prepare('SELECT * FROM action_items WHERE id = ?').get(result.lastInsertRowid) as any))
})

actionItemsRouter.patch('/:id', (req: AuthedRequest, res) => {
  const item = db.prepare('SELECT * FROM action_items WHERE id = ?').get(req.params.id) as { caseId: number } | undefined
  if (!item || !ownsCase(req.auth!.orgId, item.caseId)) {
    return res.status(404).json({ error: 'Action item not found' })
  }
  if (isCaseClosed(item.caseId)) return res.status(400).json(SEALED_ERROR)
  const { status, ownerName, dueDate } = req.body as Record<string, string>
  if (status) {
    if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    const completedAt = status === 'complete' || status === 'closed' ? "datetime('now')" : 'NULL'
    db.prepare(`UPDATE action_items SET status = ?, completedAt = ${completedAt} WHERE id = ?`).run(status, req.params.id)
  }
  if (ownerName !== undefined) db.prepare('UPDATE action_items SET ownerName = ? WHERE id = ?').run(ownerName, req.params.id)
  if (dueDate !== undefined) db.prepare('UPDATE action_items SET dueDate = ? WHERE id = ?').run(dueDate, req.params.id)

  res.json(withOverdue(db.prepare('SELECT * FROM action_items WHERE id = ?').get(req.params.id) as any))
})
