import type { Response, NextFunction } from 'express'
import { db } from './db.js'
import type { AuthedRequest } from './auth.js'

export interface TrialGateOrg {
  planStatus: string
  trialEndsAt: string | null
}

// Login is intentionally NOT blocked when a trial has expired. Someone who
// can't authenticate at all would have no way back into the app to view the
// paywall and actually subscribe. Instead, the *feature* routes (cases,
// hazards, action items, consultations, reports, hazard library, team) are
// gated here, while auth (/me, /org) and checkout stay reachable so a locked
// org can still see its status and pay to unlock.
export function isTrialExpired(org: TrialGateOrg): boolean {
  if (org.planStatus !== 'trialing') return false
  if (!org.trialEndsAt) return false
  return new Date(org.trialEndsAt).getTime() < Date.now()
}

export function requireTrialActive(req: AuthedRequest, res: Response, next: NextFunction) {
  const org = db.prepare('SELECT planStatus, trialEndsAt FROM organizations WHERE id = ?').get(req.auth!.orgId) as
    | TrialGateOrg
    | undefined
  if (!org) return res.status(404).json({ error: 'Organization not found' })

  if (isTrialExpired(org)) {
    return res.status(402).json({
      error: 'Your 7-day free trial has ended. Subscribe on the Billing page to keep using Connexus.',
      code: 'trial_expired',
    })
  }
  next()
}
