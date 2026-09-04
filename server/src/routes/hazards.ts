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

// Existing controls are fetched alongside their hazard rather than through a
// separate round trip, since the Hazard Register always needs both together
// and the count per hazard is small.
function existingControlsByHazard(hazardIds: number[]): Map<number, any[]> {
  const byHazard = new Map<number, any[]>()
  if (hazardIds.length === 0) return byHazard
  const placeholders = hazardIds.map(() => '?').join(',')
  const rows = db
    .prepare(`SELECT * FROM existing_controls WHERE hazardId IN (${placeholders}) ORDER BY createdAt ASC`)
    .all(...hazardIds) as { hazardId: number }[]
  for (const row of rows) {
    const list = byHazard.get(row.hazardId) ?? []
    list.push(row)
    byHazard.set(row.hazardId, list)
  }
  return byHazard
}

hazardsRouter.get('/', (req: AuthedRequest, res) => {
  const caseId = Number(req.query.caseId)
  if (!caseId || !ownsCase(req.auth!.orgId, caseId)) {
    return res.status(403).json({ error: 'Not authorized for this assessment' })
  }
  const rows = db.prepare('SELECT * FROM hazards WHERE caseId = ? ORDER BY riskRating DESC').all(caseId) as {
    id: number
  }[]
  const controlsByHazard = existingControlsByHazard(rows.map((r) => r.id))
  res.json(rows.map((r) => ({ ...r, existingControls: controlsByHazard.get(r.id) ?? [] })))
})

hazardsRouter.post('/', (req: AuthedRequest, res) => {
  const { caseId, hazardLibraryId, title, category, description, evidence, exposureDetail, affectedWorkers, likelihood, consequence } =
    req.body as Record<string, any>
  if (!caseId || !ownsCase(req.auth!.orgId, caseId)) {
    return res.status(403).json({ error: 'Not authorized for this assessment' })
  }
  if (isCaseClosed(caseId)) return res.status(400).json(SEALED_ERROR)
  if (!title || !category) return res.status(400).json({ error: 'Title and category are required' })

  const l = Number(likelihood) || 1
  const c = Number(consequence) || 1
  const result = db
    .prepare(
      `INSERT INTO hazards
        (caseId, hazardLibraryId, title, category, description, evidence, exposureDetail, affectedWorkers, likelihood, consequence, riskRating, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      caseId,
      hazardLibraryId || null,
      title,
      category,
      description || '',
      evidence || '',
      exposureDetail || '',
      affectedWorkers || '',
      l,
      c,
      riskRating(l, c),
      'open'
    )

  const created = db.prepare('SELECT * FROM hazards WHERE id = ?').get(result.lastInsertRowid)
  res.json({ ...(created as object), existingControls: [] })
})

hazardsRouter.patch('/:id', (req: AuthedRequest, res) => {
  const hazard = db.prepare('SELECT * FROM hazards WHERE id = ?').get(req.params.id) as { caseId: number } | undefined
  if (!hazard || !ownsCase(req.auth!.orgId, hazard.caseId)) {
    return res.status(404).json({ error: 'Hazard not found' })
  }
  if (isCaseClosed(hazard.caseId)) return res.status(400).json(SEALED_ERROR)
  const { status, residualLikelihood, residualConsequence, evidence, exposureDetail, affectedWorkers } = req.body as Record<string, any>
  if (status) {
    db.prepare('UPDATE hazards SET status = ? WHERE id = ?').run(status, req.params.id)
  }
  // Evidence/exposure/affected-worker fields document the reasoning behind a
  // rating and can be filled in or refined any time before sealing, unlike
  // residual re-rating which is gated on a verified control below.
  if (evidence !== undefined || exposureDetail !== undefined || affectedWorkers !== undefined) {
    const current = hazard as unknown as { evidence: string; exposureDetail: string; affectedWorkers: string }
    db.prepare('UPDATE hazards SET evidence = ?, exposureDetail = ?, affectedWorkers = ? WHERE id = ?').run(
      evidence !== undefined ? evidence : current.evidence,
      exposureDetail !== undefined ? exposureDetail : current.exposureDetail,
      affectedWorkers !== undefined ? affectedWorkers : current.affectedWorkers,
      req.params.id
    )
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

const EFFECTIVENESS_VALUES = ['not_evaluated', 'not_effective', 'partially_effective', 'effective']

// Existing controls already in place for a hazard, logged with an
// effectiveness rating so a reviewer can see what was already there before
// the assessment recommended anything new, and whether it's actually working.
hazardsRouter.post('/:id/controls', (req: AuthedRequest, res) => {
  const hazard = db.prepare('SELECT * FROM hazards WHERE id = ?').get(req.params.id) as { caseId: number } | undefined
  if (!hazard || !ownsCase(req.auth!.orgId, hazard.caseId)) {
    return res.status(404).json({ error: 'Hazard not found' })
  }
  if (isCaseClosed(hazard.caseId)) return res.status(400).json(SEALED_ERROR)
  const { description, effectiveness } = req.body as Record<string, any>
  if (!description || !description.trim()) return res.status(400).json({ error: 'A description is required' })
  const eff = EFFECTIVENESS_VALUES.includes(effectiveness) ? effectiveness : 'not_evaluated'
  const result = db
    .prepare('INSERT INTO existing_controls (hazardId, description, effectiveness) VALUES (?, ?, ?)')
    .run(req.params.id, description.trim(), eff)
  res.json(db.prepare('SELECT * FROM existing_controls WHERE id = ?').get(result.lastInsertRowid))
})

hazardsRouter.delete('/:id/controls/:controlId', (req: AuthedRequest, res) => {
  const hazard = db.prepare('SELECT * FROM hazards WHERE id = ?').get(req.params.id) as { caseId: number } | undefined
  if (!hazard || !ownsCase(req.auth!.orgId, hazard.caseId)) {
    return res.status(404).json({ error: 'Hazard not found' })
  }
  if (isCaseClosed(hazard.caseId)) return res.status(400).json(SEALED_ERROR)
  db.prepare('DELETE FROM existing_controls WHERE id = ? AND hazardId = ?').run(req.params.controlId, req.params.id)
  res.json({ ok: true })
})
