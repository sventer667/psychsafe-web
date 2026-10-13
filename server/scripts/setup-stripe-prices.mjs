#!/usr/bin/env node
// One-off setup script: creates the three Humanora subscription tiers as real
// Stripe Products + Prices in whatever Stripe account STRIPE_SECRET_KEY belongs
// to. Run it yourself, with your own key — never paste a Stripe secret key into
// chat or commit it to the repo:
//
//   STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe-prices.mjs
//
// It prints the three price IDs it creates. Copy those into
// STRIPE_PRICE_STARTER / STRIPE_PRICE_GROWTH / STRIPE_PRICE_ENTERPRISE in the
// backend's environment (locally in server/.env, or in /etc/humanora/api.env on
// the droplet), then restart the backend.
//
// Safe to re-run — it always creates new Products/Prices rather than mutating
// existing ones (Stripe prices are immutable once created), so re-running just
// gives you a fresh set of IDs rather than corrupting anything.

import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
  console.error('Set STRIPE_SECRET_KEY before running this script, e.g.:')
  console.error('  STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe-prices.mjs')
  process.exit(1)
}

const stripe = new Stripe(key)

const TIERS = [
  {
    tier: 'starter',
    name: 'Humanora Starter',
    amount: 8900,
    description: '1 seat · full hazard register, action plans, PDF export, cryptographic sealing',
  },
  {
    tier: 'growth',
    name: 'Humanora Growth',
    amount: 17900,
    description: 'Up to 5 seats · unlimited case files · priority email support',
  },
  {
    tier: 'enterprise',
    name: 'Humanora Enterprise',
    amount: 59900,
    description: 'Up to 20 seats · dedicated onboarding · priority support SLA',
  },
]

const priceIds = {}

for (const t of TIERS) {
  const product = await stripe.products.create({ name: t.name, description: t.description })
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'aud',
    unit_amount: t.amount,
    recurring: { interval: 'month' },
    nickname: t.name,
  })
  priceIds[t.tier] = price.id
  console.log(`${t.tier.padEnd(10)} product ${product.id}  price ${price.id}  $${(t.amount / 100).toFixed(2)} AUD/mo`)
}

console.log('\nAdd these to server/.env (or /etc/humanora/api.env on the droplet), then restart the API:\n')
console.log(`STRIPE_PRICE_STARTER=${priceIds.starter}`)
console.log(`STRIPE_PRICE_GROWTH=${priceIds.growth}`)
console.log(`STRIPE_PRICE_ENTERPRISE=${priceIds.enterprise}`)
