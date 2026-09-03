import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { ownsCase } from '../ownership.js'
import { sealCase } from '../seal.js'
import { requireTrialActive } from '../trialGate.js'

export const casesRouter = Router()
casesRouter.use(requireAuth)
casesRouter.use(requireTrialActive)

casesRouter.get('/', (req: AuthedRequest, res) => {
  const rows = db.prepare('SELECT * FROM cases WHERE orgId = ? ORDER BY createdAt DESC').all(req.auth!.orgId)
  res.json(rows)
})

// RAG heat-map: hazard categories (rows) x open case files (columns). Each cell
// is the highest risk rating among open hazards in that category for that case,
// used to colour the tile red/amber/green on the dashboard.
casesRouter.get('/heatmap', (req: AuthedRequest, res) => {
  const cases = db
    .prepare("SELECT id, name FROM cases WHERE orgId = ? AND status = 'open' ORDER BY createdAt ASC")
    .all(req.auth!.orgId) as { id: number; name: string }[]

  const categoryRows = db
    .prepare('SELECT DISTINCT category FROM hazard_library ORDER BY category ASC')
    .all() as { category: string }[]
  const categories = categoryRows.map((r) => r.category)

  const caseIds = cases.map((c) => c.id)
  const cells: { caseId: number; category: string; maxRating: number; hazardCount: number }[] = []

  if (caseIds.length > 0) {
    const placeholders = caseIds.map(() => '?').join(',')
    const hazardRows = db
      .prepare(
        `SELECT caseId, category, riskRating FROM hazards WHERE caseId IN (${placeholders}) AND status != 'closed'`
      )
      .all(...caseIds) as { caseId: number; category: string; riskRating: number }[]

    const byKey = new Map<string, { maxRating: number; hazardCount: number }>()
    for (const h of hazardRows) {
      const key = `${h.caseId}::${h.category}`
      const existing = byKey.get(key)
      if (existing) {
        existing.maxRating = Math.max(existing.maxRating, h.riskRating)
        existing.hazardCount += 1
      } else {
        byKey.set(key, { maxRating: h.riskRating, hazardCount: 1 })
      }
    }
    for (const c of cases) {
      for (const category of categories) {
        const entry = byKey.get(`${c.id}::${category}`)
        cells.push({
          caseId: c.id,
          category,
          maxRating: entry?.maxRating ?? 0,
          hazardCount: entry?.hazardCount ?? 0,
        })
      }
    }
  }

  res.json({ cases, categories, cells })
})

// Org-wide inherent vs. residual risk gauges: the average risk rating across
// every open hazard in every open assessment, expressed as a percentage of
// the maximum possible score (5 x 5 = 25). Residual falls back to a hazard's
// inherent score whenever it hasn't been re-rated after controls, so an
// un-rated hazard never silently understates the org's residual exposure.
const MAX_RISK_RATING = 25

casesRouter.get('/gauges', (req: AuthedRequest, res) => {
  const caseIds = (
    db.prepare("SELECT id FROM cases WHERE orgId = ? AND status = 'open'").all(req.auth!.orgId) as { id: number }[]
  ).map((c) => c.id)

  if (caseIds.length === 0) {
    return res.json({ hazardCount: 0, inherentScore: 0, residualScore: 0, inherentPct: 0, residualPct: 0 })
  }

  const placeholders = caseIds.map(() => '?').join(',')
  const hazards = db
    .prepare(
      `SELECT riskRating, residualRiskRating FROM hazards WHERE caseId IN (${placeholders}) AND status != 'closed'`
    )
    .all(...caseIds) as { riskRating: number; residualRiskRating: number | null }[]

  if (hazards.length === 0) {
    return res.json({ hazardCount: 0, inherentScore: 0, residualScore: 0, inherentPct: 0, residualPct: 0 })
  }

  const inherentSum = hazards.reduce((sum, h) => sum + h.riskRating, 0)
  const residualSum = hazards.reduce((sum, h) => sum + (h.residualRiskRating ?? h.riskRating), 0)
  const inherentScore = inherentSum / hazards.length
  const residualScore = residualSum / hazards.length

  res.json({
    hazardCount: hazards.length,
    inherentScore: Math.round(inherentScore * 10) / 10,
    residualScore: Math.round(residualScore * 10) / 10,
    inherentPct: Math.round((inherentScore / MAX_RISK_RATING) * 100),
    residualPct: Math.round((residualScore / MAX_RISK_RATING) * 100),
  })
})

casesRouter.post('/', (req: AuthedRequest, res) => {
  const { name, state } = req.body as Record<string, any>
  if (!name) return res.status(400).json({ error: 'Assessment name is required' })

  // Defaults to the org's own state if the caller doesn't specify one (e.g.
  // an older client), but each assessment can be tagged with its own state
  // so orgs with sites in more than one state get accurate legislation
  // citations per assessment rather than a single org-wide state.
  let resolvedState = state
  if (resolvedState === undefined) {
    const org = db.prepare('SELECT state FROM organizations WHERE id = ?').get(req.auth!.orgId) as
      | { state: string }
      | undefined
    resolvedState = org?.state || ''
  }

  const result = db
    .prepare('INSERT INTO cases (orgId, name, state, status) VALUES (?, ?, ?, ?)')
    .run(req.auth!.orgId, name, resolvedState, 'open')

  res.json(db.prepare('SELECT * FROM cases WHERE id = ?').get(result.lastInsertRowid))
})

casesRouter.get('/:id', (req: AuthedRequest, res) => {
  if (!ownsCase(req.auth!.orgId, req.params.id)) return res.status(404).json({ error: 'Assessment not found' })
  const c = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id)
  const sealHistory = db
    .prepare('SELECT * FROM case_seal_events WHERE caseId = ? ORDER BY createdAt ASC, id ASC')
    .all(req.params.id)
  res.json({ ...(c as object), sealHistory })
})

casesRouter.patch('/:id', (req: AuthedRequest, res) => {
  if (!ownsCase(req.auth!.orgId, req.params.id)) return res.status(404).json({ error: 'Assessment not found' })
  const c = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id) as { status: string } | undefined
  if (!c) return res.status(404).json({ error: 'Assessment not found' })
  if (c.status === 'closed') return res.status(400).json({ error: 'This assessment is sealed and cannot be edited' })

  const { state } = req.body as Record<string, any>
  if (state !== undefined) {
    db.prepare('UPDATE cases SET state = ? WHERE id = ?').run(state, req.params.id)
  }
  res.json(db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id))
})

// Looks up the display name for the current user, to attribute seal/reopen
// events to a person rather than just a userId (so the audit trail and PDF
// export read like "Reopened by Jane Smith", not "Reopened by user 4").
function currentUserName(userId: number): string {
  const row = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as { name: string } | undefined
  return row?.name || ''
}

function recordSealEvent(
  caseId: number | string,
  eventType: 'sealed' | 'reopened',
  userId: number,
  reason: string,
  seal: {
    hash: string | null
    algorithm: string | null
    timestampToken: string | null
    timestampAuthority: string | null
    timestampTime: string | null
  }
) {
  db.prepare(
    `INSERT INTO case_seal_events
      (caseId, eventType, userId, userName, reason, sealHash, sealAlgorithm, sealTimestampToken, sealTimestampAuthority, sealTimestampTime)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    caseId,
    eventType,
    userId,
    currentUserName(userId),
    reason,
    seal.hash,
    seal.algorithm,
    seal.timestampToken,
    seal.timestampAuthority,
    seal.timestampTime
  )
}

// Minimum bar for what counts as a complete assessment: at least one hazard
// has actually been logged, and at least one consultation has been recorded
// (WHS consultation is a legislative requirement, not an optional extra).
// This doesn't attempt to judge the *quality* of the assessment, just catch
// the case of someone sealing an essentially empty record.
function closeReadinessErrors(caseId: number | string): string[] {
  const errors: string[] = []
  const hazardCount = (
    db.prepare('SELECT COUNT(*) as n FROM hazards WHERE caseId = ?').get(caseId) as { n: number }
  ).n
  if (hazardCount === 0) {
    errors.push('Add at least one hazard to the Hazard Register before sealing this assessment')
  }
  const consultationCount = (
    db.prepare('SELECT COUNT(*) as n FROM consultations WHERE caseId = ?').get(caseId) as { n: number }
  ).n
  if (consultationCount === 0) {
    errors.push('Record at least one consultation before sealing this assessment')
  }
  return errors
}

casesRouter.post('/:id/close', async (req: AuthedRequest, res) => {
  if (!ownsCase(req.auth!.orgId, req.params.id)) return res.status(404).json({ error: 'Assessment not found' })
  const c = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id) as { status: string } | undefined
  if (!c) return res.status(404).json({ error: 'Assessment not found' })
  if (c.status === 'closed') return res.status(400).json({ error: 'Assessment is already closed' })

  const readinessErrors = closeReadinessErrors(req.params.id)
  if (readinessErrors.length > 0) {
    return res.status(400).json({ error: readinessErrors.join('. ') })
  }

  try {
    const seal = await sealCase(Number(req.params.id))
    db.prepare(
      `UPDATE cases SET status = 'closed', closedAt = datetime('now'), sealHash = ?, sealAlgorithm = ?,
       sealTimestampToken = ?, sealTimestampAuthority = ?, sealTimestampTime = ? WHERE id = ?`
    ).run(seal.hash, seal.algorithm, seal.timestampToken, seal.timestampAuthority, seal.timestampTime, req.params.id)
    recordSealEvent(req.params.id, 'sealed', req.auth!.userId, '', seal)
    res.json(db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id))
  } catch (err) {
    console.error('Assessment sealing failed', err)
    res.status(500).json({ error: 'Failed to seal assessment' })
  }
})

// Reopening breaks a seal, so it now requires a short written reason and
// records who did it and when, plus a copy of the seal it just invalidated,
// permanently in case_seal_events. Nothing about the previous seal is
// discarded: it's cleared from `cases` (since it no longer describes the
// case's current contents) but preserved forever in the audit trail.
casesRouter.post('/:id/reopen', (req: AuthedRequest, res) => {
  if (!ownsCase(req.auth!.orgId, req.params.id)) return res.status(404).json({ error: 'Assessment not found' })
  const c = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id) as
    | {
        status: string
        sealHash: string | null
        sealAlgorithm: string | null
        sealTimestampToken: string | null
        sealTimestampAuthority: string | null
        sealTimestampTime: string | null
      }
    | undefined
  if (!c) return res.status(404).json({ error: 'Assessment not found' })
  if (c.status !== 'closed') return res.status(400).json({ error: 'Assessment is not sealed' })

  const { reason } = req.body as Record<string, string>
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A reason is required to reopen a sealed assessment' })
  }

  recordSealEvent(req.params.id, 'reopened', req.auth!.userId, reason.trim(), {
    hash: c.sealHash,
    algorithm: c.sealAlgorithm,
    timestampToken: c.sealTimestampToken,
    timestampAuthority: c.sealTimestampAuthority,
    timestampTime: c.sealTimestampTime,
  })

  db.prepare(
    "UPDATE cases SET status = 'open', closedAt = NULL, sealHash = NULL, sealAlgorithm = NULL, sealTimestampToken = NULL, sealTimestampAuthority = NULL, sealTimestampTime = NULL WHERE id = ?"
  ).run(req.params.id)

  const sealHistory = db
    .prepare('SELECT * FROM case_seal_events WHERE caseId = ? ORDER BY createdAt ASC, id ASC')
    .all(req.params.id)
  const updated = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id)
  res.json({ ...(updated as object), sealHistory })
})
