import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { ownsCase, isCaseClosed } from '../ownership.js'
import { requireTrialActive } from '../trialGate.js'

const SEALED_ERROR = { error: 'This assessment is sealed and cannot be edited' }

export const hazardsRouter = Router()
hazardsRouter.use(requireAuth)
hazardsRouter.use(requireTrialActive)

function riskRating(likelihood: number, consequence: number) {
  return likelihood * consequence
}

hazardsRouter.get('/', (req: AuthedRequest, res) => {
  const caseId = Number(req.query.caseId)
  if (!caseId || !ownsCase(req.auth!.orgId, caseId)) {
    return res.status(403).json({ error: 'Not authorized for this assessment' })
  }
  const rows = db.prepare('SELECT * FROM hazards WHERE caseId = ? ORDER BY riskRating DESC').all(caseId)
  res.json(rows)
})

hazardsRouter.post('/', (req: AuthedRequest, res) => {
  const { caseId, hazardLibraryId, title, category, description, likelihood, consequence } = req.body as Record<string, any>
  if (!caseId || !ownsCase(req.auth!.orgId, caseId)) {
    return res.status(403).json({ error: 'Not authorized for this assessment' })
  }
  if (isCaseClosed(caseId)) return res.status(400).json(SEALED_ERROR)
  if (!title || !category) return res.status(400).json({ error: 'Title and category are required' })

  const l = Number(likelihood) || 1
  const c = Number(consequence) || 1
  const result = db
    .prepare(
      'INSERT INTO hazards (caseId, hazardLibraryId, title, category, description, likelihood, consequence, riskRating, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(caseId, hazardLibraryId || null, title, category, description || '', l, c, riskRating(l, c), 'open')

  res.json(db.prepare('SELECT * FROM hazards WHERE id = ?').get(result.lastInsertRowid))
})

hazardsRouter.patch('/:id', (req: AuthedRequest, res) => {
  const hazard = db.prepare('SELECT * FROM hazards WHERE id = ?').get(req.params.id) as { caseId: number } | undefined
  if (!hazard || !ownsCase(req.auth!.orgId, hazard.caseId)) {
    return res.status(404).json({ error: 'Hazard not found' })
  }
  if (isCaseClosed(hazard.caseId)) return res.status(400).json(SEALED_ERROR)
  const { status, residualLikelihood, residualConsequence } = req.body as Record<string, any>
  if (status) {
    db.prepare('UPDATE hazards SET status = ? WHERE id = ?').run(status, req.params.id)
  }
  if (residualLikelihood !== undefined && residualConsequence !== undefined) {
    // Residual risk is meant to reflect risk *after* a control has actually
    // been implemented, not just planned or logged. Require at least one
    // action item linked to this hazard to be marked complete/closed before
    // accepting a re-rating, so the residual gauge can't be improved just by
    // typing in a lower number.
    const verifiedControl = db
      .prepare(
        `SELECT 1 FROM action_items WHERE hazardId = ? AND status IN ('complete', 'closed') LIMIT 1`
      )
      .get(req.params.id)
    if (!verifiedControl) {
      return res.status(400).json({
        error: 'Mark at least one linked action item as complete before re-rating residual risk for this hazard',
      })
    }
    const rl = Number(residualLikelihood) || 1
    const rc = Number(residualConsequence) || 1
    db.prepare(
      `UPDATE hazards SET residualLikelihood = ?, residualConsequence = ?, residualRiskRating = ?, residualRatedAt = datetime('now') WHERE id = ?`
    ).run(rl, rc, riskRating(rl, rc), req.params.id)
  }
  res.json(db.prepare('SELECT * FROM hazards WHERE id = ?').get(req.params.id))
})
