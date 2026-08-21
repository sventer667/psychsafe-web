import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'
import { requireTrialActive } from '../trialGate.js'

export const hazardLibraryRouter = Router()
hazardLibraryRouter.use(requireAuth)
hazardLibraryRouter.use(requireTrialActive)

// Read-only reference data shared across all orgs: the psychosocial hazard
// categories recognised under Australian WHS codes of practice, each with a
// staged pathway of controls and legislation citations for every state/territory.
hazardLibraryRouter.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM hazard_library ORDER BY category, name').all() as any[]
  res.json(
    rows.map((r) => ({
      ...r,
      controls: JSON.parse(r.controls),
      legislation: JSON.parse(r.legislation),
    }))
  )
})
