import { Router } from 'express'
import Stripe from 'stripe'
import { db } from '../db.js'
import { PLAN_TIERS, type PlanTier } from '../plans.js'

export const stripeWebhookRouter = Router()

// Maps a Stripe price ID back to a Connexus plan tier by checking which of the
// three STRIPE_PRICE_* env vars it matches. Used when a subscription event
// doesn't carry our own metadata (e.g. a tier change made from the Stripe
// customer portal rather than through /checkout/create-session).
function tierForPriceId(priceId: string | undefined): PlanTier | null {
  if (!priceId) return null
  const envToTier: [string | undefined, PlanTier][] = [
    [process.env.STRIPE_PRICE_STARTER, 'starter'],
    [process.env.STRIPE_PRICE_GROWTH, 'growth'],
    [process.env.STRIPE_PRICE_ENTERPRISE, 'enterprise'],
  ]
  return envToTier.find(([id]) => id === priceId)?.[1] ?? null
}

function tierFromMetadata(metadata: Stripe.Metadata | null | undefined): PlanTier | null {
  const tier = metadata?.tier
  return tier && PLAN_TIERS.includes(tier as PlanTier) ? (tier as PlanTier) : null
}

// Requires express.raw() body parsing, wired in index.ts before express.json().
stripeWebhookRouter.post('/', async (req, res) => {
  const key = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !webhookSecret) {
    return res.status(501).send('Stripe webhook not configured')
  }

  const stripe = new Stripe(key)
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'] as string, webhookSecret)
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed`)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
      const tier = tierFromMetadata(session.metadata)
      if (customerId) {
        if (tier) {
          db.prepare("UPDATE organizations SET planStatus = 'active', planTier = ? WHERE stripeCustomerId = ?").run(tier, customerId)
        } else {
          db.prepare("UPDATE organizations SET planStatus = 'active' WHERE stripeCustomerId = ?").run(customerId)
        }
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
      const priceId = sub.items.data[0]?.price?.id
      const tier = tierFromMetadata(sub.metadata) || tierForPriceId(priceId)
      if (customerId) {
        if (tier) {
          db.prepare("UPDATE organizations SET planStatus = 'active', planTier = ? WHERE stripeCustomerId = ?").run(tier, customerId)
        } else {
          db.prepare("UPDATE organizations SET planStatus = 'active' WHERE stripeCustomerId = ?").run(customerId)
        }
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
      if (customerId) {
        db.prepare("UPDATE organizations SET planStatus = 'canceled' WHERE stripeCustomerId = ?").run(customerId)
      }
      break
    }
  }

  res.json({ received: true })
})
