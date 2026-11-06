import { Router } from 'express'
import Stripe from 'stripe'
import { db } from '../db.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { PLAN_TIERS, type PlanTier } from '../plans.js'

export const checkoutRouter = Router()
checkoutRouter.use(requireAuth)

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.startsWith('sk_test_...')) return null
  return new Stripe(key)
}

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Each tier is a separate Stripe Price, created via
// server/scripts/setup-stripe-prices.mjs and set as an env var. STRIPE_PRICE_ID
// is kept as a fallback for the "growth" tier so any pre-existing single-price
// setup keeps working.
const TIER_PRICE_ENV: Record<PlanTier, string> = {
  starter: 'STRIPE_PRICE_STARTER',
  growth: 'STRIPE_PRICE_GROWTH',
  enterprise: 'STRIPE_PRICE_ENTERPRISE',
}

// Annual billing: one extra Stripe Price per tier (12 months for the price of
// 11), created with server/scripts/setup-stripe-annual-prices.mjs.
const TIER_ANNUAL_PRICE_ENV: Record<PlanTier, string> = {
  starter: 'STRIPE_PRICE_STARTER_ANNUAL',
  growth: 'STRIPE_PRICE_GROWTH_ANNUAL',
  enterprise: 'STRIPE_PRICE_ENTERPRISE_ANNUAL',
}

// Placeholder values (from .env.example, never replaced with a real ID) must
// be treated the same as "not set", otherwise a literal "price_..." gets
// passed straight to the Stripe API as if it were real.
function isPlaceholder(value: string | undefined): boolean {
  return !value || value.endsWith('...')
}

function priceIdFor(tier: PlanTier, interval: 'month' | 'year' = 'month'): string | undefined {
  if (interval === 'year') {
    const annual = process.env[TIER_ANNUAL_PRICE_ENV[tier]]
    return isPlaceholder(annual) ? undefined : annual
  }
  const tierSpecific = process.env[TIER_PRICE_ENV[tier]]
  if (!isPlaceholder(tierSpecific)) return tierSpecific
  if (tier === 'growth' && !isPlaceholder(process.env.STRIPE_PRICE_ID)) return process.env.STRIPE_PRICE_ID
  return undefined
}

// Creates a Stripe Checkout session for the org's subscription to a specific
// pricing tier. Mirrors the /api/checkout/create-session pattern used by
// psychosocialguard.com.au, extended to support the three Humanora tiers.
//
// Every Stripe call below is try/caught deliberately: an async route handler
// that throws (e.g. because Stripe is unreachable, or a misconfigured price ID
// gets rejected) becomes an unhandled promise rejection in Express 4, which
// crashes the whole Node process, taking every org's API down, not just this
// one request. Never let a Stripe call escape uncaught here.
checkoutRouter.post('/create-session', async (req: AuthedRequest, res) => {
  const stripe = getStripe()
  if (!stripe) {
    return res.status(501).json({
      error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in server/.env to enable billing.',
    })
  }

  const tier = (req.body?.tier as string) || 'growth'
  if (!PLAN_TIERS.includes(tier as PlanTier)) {
    return res.status(400).json({ error: 'Invalid plan tier' })
  }
  const interval: 'month' | 'year' = req.body?.interval === 'year' ? 'year' : 'month'
  const priceId = priceIdFor(tier as PlanTier, interval)
  if (!priceId) {
    const envName = interval === 'year' ? TIER_ANNUAL_PRICE_ENV[tier as PlanTier] : TIER_PRICE_ENV[tier as PlanTier]
    return res.status(501).json({
      error: `No Stripe ${interval === 'year' ? 'annual ' : ''}price configured for the ${tier} tier. Set ${envName} in the API environment.`,
    })
  }

  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.auth!.orgId) as
    | { id: number; name: string; stripeCustomerId: string | null }
    | undefined
  if (!org) return res.status(404).json({ error: 'Organization not found' })

  try {
    let customerId = org.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({ name: org.name, metadata: { orgId: String(org.id) } })
      customerId = customer.id
      db.prepare('UPDATE organizations SET stripeCustomerId = ? WHERE id = ?').run(customerId, org.id)
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${CLIENT_URL}/billing?checkout=success`,
      cancel_url: `${CLIENT_URL}/billing?checkout=cancelled`,
      metadata: { orgId: String(org.id), tier, interval },
      subscription_data: { metadata: { orgId: String(org.id), tier, interval } },
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout session creation failed', err)
    res.status(502).json({ error: 'Could not reach Stripe to start checkout. Check STRIPE_SECRET_KEY and the price IDs, then try again.' })
  }
})

// Creates a Stripe Billing Portal session so the org can manage/cancel their subscription.
checkoutRouter.post('/portal', async (req: AuthedRequest, res) => {
  const stripe = getStripe()
  if (!stripe) {
    return res.status(501).json({ error: 'Stripe is not configured.' })
  }

  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.auth!.orgId) as
    | { stripeCustomerId: string | null }
    | undefined
  if (!org?.stripeCustomerId) {
    return res.status(400).json({ error: 'No billing account on file yet.' })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${CLIENT_URL}/billing`,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe billing portal session creation failed', err)
    res.status(502).json({ error: 'Could not reach Stripe to open the billing portal. Try again shortly.' })
  }
})
