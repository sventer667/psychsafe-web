import type { Case, Organization } from './types'

// Psychosocial risk management is meant to be a cycle (identify, assess,
// control, review), not a one-off. This computes when an org is next due to
// start a fresh assessment, derived from its most recent case's start date
// plus its own review cadence, rather than a separately-stored due date that
// could drift out of sync with what actually happened.
const DAY_MS = 24 * 60 * 60 * 1000
const DUE_SOON_WINDOW_DAYS = 30

export function nextReviewDueDate(cases: Case[], org: Organization | null): Date | null {
  if (!org || cases.length === 0) return null
  const mostRecent = cases.reduce((latest, c) => (new Date(c.createdAt) > new Date(latest.createdAt) ? c : latest))
  const due = new Date(mostRecent.createdAt)
  due.setMonth(due.getMonth() + (org.reviewFrequencyMonths || 12))
  return due
}

export type ReviewStatus = 'none' | 'ok' | 'due_soon' | 'overdue'

export function reviewStatus(cases: Case[], org: Organization | null): { status: ReviewStatus; dueDate: Date | null } {
  const dueDate = nextReviewDueDate(cases, org)
  if (!dueDate) return { status: 'none', dueDate: null }
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / DAY_MS)
  if (daysUntilDue < 0) return { status: 'overdue', dueDate }
  if (daysUntilDue <= DUE_SOON_WINDOW_DAYS) return { status: 'due_soon', dueDate }
  return { status: 'ok', dueDate }
}
