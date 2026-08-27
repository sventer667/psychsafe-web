import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import './db.js'
import { authRouter } from './routes/auth.js'
import { casesRouter } from './routes/cases.js'
import { hazardLibraryRouter } from './routes/hazardLibrary.js'
import { hazardsRouter } from './routes/hazards.js'
import { actionItemsRouter } from './routes/actionItems.js'
import { consultationsRouter } from './routes/consultations.js'
import { reportsRouter } from './routes/reports.js'
import { checkoutRouter } from './routes/checkout.js'
import { stripeWebhookRouter } from './routes/stripeWebhook.js'
import { invitesRouter } from './routes/invites.js'

// Safety net: Node crashes the whole process on an unhandled promise
// rejection by default. Every route that calls an external service (Stripe,
// the RFC 3161 timestamp authority) is written to catch its own errors, but
// this is a last line of defense so one missed case degrades to a logged
// error instead of taking down every org's API.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection (recovered, not crashing):', err)
})

const app = express()

app.use(cors())

// Pre-launch gate: mirrors the frontend's "coming soon" placeholder (see the
// client's App.tsx / lib/previewAccess.ts) so the API can't be used
// directly, e.g. by curling the signup endpoint, while the public site is
// hidden. Blocks every request except the health check (Render's health
// monitor needs this to keep the service up) and requests carrying the same
// preview secret the frontend attaches once someone has unlocked the demo.
// To bring the API back for real launch, remove MAINTENANCE_MODE (or set it
// to anything other than "true") in the Render env vars, no code change or
// redeploy of this logic needed.
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true'
const PREVIEW_ACCESS_SECRET = process.env.PREVIEW_ACCESS_SECRET || ''

if (MAINTENANCE_MODE) {
  app.use((req, res, next) => {
    if (req.path === '/api/health') return next()
    if (PREVIEW_ACCESS_SECRET && req.get('X-Preview-Access') === PREVIEW_ACCESS_SECRET) return next()
    res.status(503).json({ error: 'Service temporarily unavailable' })
  })
}

// Stripe webhooks need the raw body for signature verification, so this is
// mounted before express.json() and excluded from JSON parsing.
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookRouter)

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/cases', casesRouter)
app.use('/api/hazard-library', hazardLibraryRouter)
app.use('/api/hazards', hazardsRouter)
app.use('/api/action-items', actionItemsRouter)
app.use('/api/consultations', consultationsRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api', invitesRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

const port = Number(process.env.PORT) || 4000
app.listen(port, () => {
  console.log(`Connexus API listening on http://localhost:${port}`)
})
