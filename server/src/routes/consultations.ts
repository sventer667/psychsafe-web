import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { ownsCase, isCaseClosed } from '../ownership.js'
import { requireTrialActive } from '../trialGate.js'

const SEALED_ERROR = { error: 'This assessment is sealed and cannot be edited' }

export const consultationsRouter = Router()
consultationsRouter.use(requireAuth)
consultationsRouter.use(requireTrialActive)

consultationsRouter.get('/', (req: AuthedRequest, res) => {
  const caseId = Number(req.query.caseId)
  if (!caseId || !ownsCase(req.auth!.orgId, caseId)) {
    return res.status(403).json({ error: 'Not authorized for this assessment' })
  }
  const rows = db.prepare('SELECT * FROM consultations WHERE caseId = ? ORDER BY date DESC').all(caseId)
  res.json(rows)
})

consultationsRouter.post('/', (req: AuthedRequest, res) => {
  const { caseId, date, method, attendees, summary } = req.body as Record<string, any>
  if (!caseId || !ownsCase(req.auth!.orgId, caseId)) {
    return res.status(403).json({ error: 'Not authorized for this assessment' })
  }
  if (isCaseClosed(caseId)) return res.status(400).json(SEALED_ERROR)
  if (!date) return res.status(400).json({ error: 'Date is required' })

  const result = db
    .prepare('INSERT INTO consultations (caseId, date, method, attendees, summary) VALUES (?, ?, ?, ?, ?)')
    .run(caseId, date, method || '', attendees || '', summary || '')

  res.json(db.prepare('SELECT * FROM consultations WHERE id = ?').get(result.lastInsertRowid))
})
