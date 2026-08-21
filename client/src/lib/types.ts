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

export interface Hazard {
  id: number
  caseId: number
  hazardLibraryId: number | null
  title: string
  category: string
  description: string
  likelihood: number
  consequence: number
  riskRating: number
  residualLikelihood: number | null
  residualConsequence: number | null
  residualRiskRating: number | null
  residualRatedAt: string | null
  status: 'open' | 'controlled' | 'closed'
  createdAt: string
}

export type ActionStatus = 'pending' | 'in_progress' | 'verification_pending' | 'complete' | 'closed'

export interface ActionItem {
  id: number
  caseId: number
  hazardId: number | null
  title: string
  description: string
  ownerName: string
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
