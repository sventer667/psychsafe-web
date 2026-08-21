// Seat limits per plan tier. Tier selection is currently set directly on the
// organization (see routes/auth.ts PATCH /org) rather than driven by distinct
// Stripe prices, that wiring is a follow-up once real per-tier billing goes
// live. Until then this is the single source of truth for how many users an
// org can have.
export const PLAN_TIERS = ['starter', 'growth', 'enterprise'] as const
export type PlanTier = (typeof PLAN_TIERS)[number]

export const SEAT_LIMITS: Record<PlanTier, number> = {
  starter: 1,
  growth: 3,
  enterprise: 10,
}

export function seatLimitFor(tier: string): number {
  return SEAT_LIMITS[tier as PlanTier] ?? SEAT_LIMITS.starter
}
