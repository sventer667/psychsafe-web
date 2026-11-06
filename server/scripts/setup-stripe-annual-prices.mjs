#!/usr/bin/env node
// Creates the three ANNUAL Stripe Prices (12 months for the price of 11) on the
// same Products as your existing monthly prices. Run it yourself with your own
// key; never paste a Stripe secret key into chat or commit it:
//
//   STRIPE_SECRET_KEY=sk_live_... \
//   STRIPE_PRICE_STARTER=price_... STRIPE_PRICE_GROWTH=price_... STRIPE_PRICE_ENTERPRISE=price_... \
//   node scripts/setup-stripe-annual-prices.mjs
//
// It prints STRIPE_PRICE_*_ANNUAL lines to add to /etc/humanora/api.env on the
// droplet (then restart the API). Re-running creates new prices (Stripe prices
// are immutable), so only run it once per environment.

import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
  console.error('Set STRIPE_SECRET_KEY first.')
  process.exit(1)
}
const stripe = new Stripe(key)

// Annual amount = 11 x monthly, in cents (AUD).
const TIERS = [
  { tier: 'starter', env: 'STRIPE_PRICE_STARTER', monthly: 8900 },
  { tier: 'growth', env: 'STRIPE_PRICE_GROWTH', monthly: 17900 },
  { tier: 'enterprise', env: 'STRIPE_PRICE_ENTERPRISE', monthly: 59900 },
]

const out = []
for (const t of TIERS) {
  const monthlyId = process.env[t.env]
  if (!monthlyId) {
    console.error(`Set ${t.env} to the existing monthly price ID so the annual price can share its product.`)
    process.exit(1)
  }
  const existing = await stripe.prices.retrieve(monthlyId)
  const price = await stripe.prices.create({
    product: typeof existing.product === 'string' ? existing.product : existing.product.id,
    currency: 'aud',
    unit_amount: t.monthly * 11,
    recurring: { interval: 'year' },
    nickname: `${t.tier} annual (11 months)`,
  })
  console.log(`${t.tier.padEnd(10)} price ${price.id}  $${((t.monthly * 11) / 100).toFixed(2)} AUD/yr`)
  out.push(`STRIPE_PRICE_${t.tier.toUpperCase()}_ANNUAL=${price.id}`)
}
console.log('\nAdd these to /etc/humanora/api.env, then restart the API:\n')
console.log(out.join('\n'))
