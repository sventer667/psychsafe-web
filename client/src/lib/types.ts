export interface User {
  id: number
  email: string
  name: string
  orgId: number
  role: 'admin' | 'member'
  totpEnabled: boolean
}

export type PlanTier = 'starter' | 'growth' | 'enterprise'

export interface Organization {
  id: number
  name: string
  industry: string
  state: string
  businessUnit: string
  planStatus: 'trialing' | 'active' | 'past_due' | 'canceled'
  planTier: PlanTier
  trialEndsAt: string | null
  stripeCustomerId: string | null
  consultantName: string
  consultantCredential: string
  reviewFrequencyMonths: number
}

export interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

export interface TeamInvite {
  id: number
  name: string
  email: string
  token: string
  createdAt: string
  expiresAt: string
}

export interface TeamData {
  users: TeamMember[]
  invites: TeamInvite[]
  seatLimit: number
  seatsUsed: number
  planTier: PlanTier
}

export interface SealEvent {
  id: number
  caseId: number
  eventType: 'sealed' | 'reopened'
  userId: number | null
  userName: string
  reason: string
  sealHash: string | null
  sealAlgorithm: string | null
  sealTimestampToken: string | null
  sealTimestampAuthority: string | null
  sealTimestampTime: string | null
  createdAt: string
}

export interface Case {
  id: number
  orgId: number
  name: string
  state: string
  scope: string
  status: 'open' | 'closed'
  createdAt: string
  closedAt: string | null
  sealHash: string | null
  sealAlgorithm: string | null
  sealTimestampToken: string | null
  sealTimestampAuthority: string | null
  sealTimestampTime: string | null
  sealHistory?: SealEvent[]
}

export interface HazardLibraryEntry {
  id: number
  name: string
  category: string
  description: string
  controls: string[]
  legislation: Record<string, string>
}

export type ControlEffectiveness = 'not_evaluated' | 'not_effective' | 'partially_effective' | 'effective'

export interface ExistingControl {
  id: number
  hazardId: number
  description: string
  effectiveness: ControlEffectiveness
  createdAt: string
}

// The four kinds of source material an assessor can cite as the specific
// evidence backing a hazard's rating. 'other' covers anything that doesn't
// fit the three named WHS-standard sources (a consultation note, a media
// report, an auditor's finding, etc).
export type EvidenceType = 'incident_report' | 'exit_interview' | 'survey_result' | 'other'

// A single structured, citable piece of evidence for a hazard: a title, an
// optional date the source material relates to, an optional link to where
// the real document actually lives (the app doesn't store files itself), and
// a short note on what it shows. Distinct from Hazard.evidence, which stays
// a single free-text summary/basis statement; this is the itemized log
// behind it.
export interface HazardEvidence {
  id: number
  hazardId: number
  type: EvidenceType
  title: string
  sourceDate: string | null
  link: string
  description: string
  createdAt: string
}

export interface Hazard {
  id: number
  caseId: number
  hazardLibraryId: number | null
  title: string
  category: string
  description: string
  evidence: string
  exposureDetail: string
  affectedWorkers: string
  likelihood: number
  consequence: number
  riskRating: number
  residualLikelihood: number | null
  residualConsequence: number | null
  residualRiskRating: number | null
  residualRatedAt: string | null
  status: 'open' | 'controlled' | 'closed'
  createdAt: string
  existingControls: ExistingControl[]
  evidenceItems: HazardEvidence[]
}

export type ActionStatus = 'pending' | 'in_progress' | 'verification_pending' | 'complete' | 'closed'

export interface ActionItem {
  id: number
  caseId: number
  hazardId: number | null
  title: string
  description: string
  ownerId: number | null
  ownerName: string
  ownerEmail: string | null
  dueDate: string | null
  status: ActionStatus
  createdAt: string
  completedAt: string | null
  isOverdue: boolean
}

export interface Consultation {
  id: number
  caseId: number
  date: string
  method: string
  attendees: string
  summary: string
  createdAt: string
}

export interface HeatmapCell {
  caseId: number
  category: string
  maxRating: number
  hazardCount: number
}

export interface Heatmap {
  cases: { id: number; name: string }[]
  categories: string[]
  cells: HeatmapCell[]
}

export interface RiskGauges {
  hazardCount: number
  inherentScore: number
  residualScore: number
  inherentPct: number
  residualPct: number
}

// Most recent prior rating of a hazard from an earlier assessment cycle for
// this org, keyed by hazardLibraryId. Used to show "last rated X" context
// when re-adding a hazard from the library rather than starting blank.
export interface HazardHistoryEntry {
  hazardLibraryId: number
  riskRating: number
  residualRiskRating: number | null
  ratedAt: string
  caseName: string
}
