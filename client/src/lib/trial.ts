import type { Organization } from './types'

export function isTrialExpired(org: Organization | null): boolean {
  if (!org) return false
  if (org.planStatus !== 'trialing') return false
  if (!org.trialEndsAt) return false
  return new Date(org.trialEndsAt).getTime() < Date.now()
}

// Whole days remaining, rounded up. "0" still means "expires later today",
// only a negative number means it has actually passed.
export function daysLeftInTrial(org: Organization | null): number | null {
  if (!org || org.planStatus !== 'trialing' || !org.trialEndsAt) return null
  const ms = new Date(org.trialEndsAt).getTime() - Date.now()
  return Math.ceil(ms / (24 * 60 * 60 * 1000))
}
