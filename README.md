# Connexus

A psychosocial risk management and assessment tool for organisations — self-service, not a
consultant tool. Each organisation that signs up manages its own psychosocial hazards, action
plans, and consultation records directly, aligned to the WHS psychosocial regulations and codes
of practice in its own state or territory. Built as two separate projects:

- `client/` — React 18 + TypeScript + Vite + Tailwind v4 + React Router + lucide-react
- `server/` — Express + TypeScript + SQLite (Node's built-in `node:sqlite`) + JWT auth +
  `node-forge` (RFC 3161 timestamping) + `pdfkit` (PDF reports) + Stripe

## Live app

- App: https://connexus-app.onrender.com
- API: https://connexus-api-f5h7.onrender.com/api

## What it does

Connexus turns a psychosocial risk assessment into a structured, auditable **Case File** instead
of a folder of scattered documents. There's no separate "client" layer — the organisation that
signs up is the organisation being assessed.

- **Organisation profile** — industry, state/territory, and business unit, set once on the
  Billing page. The state/territory drives which legislation citations show up everywhere else.
- **Case Files** — every assessment lives in a five-tab workflow:
  - **Details** — case metadata, open/closed status, and the cryptographic seal once closed
  - **Hazard Register** — pull hazards from a built-in reference library aligned to WHS codes of
    practice nationwide, each carrying a staged pathway of controls and the specific legislation
    for your organisation's state or territory (NSW, VIC, QLD, WA, SA, TAS, ACT, NT)
  - **Action Plan** — assign owners and due dates; status moves through Pending → In Progress →
    Verification Pending → Complete → Closed, with overdue items flagged automatically
  - **Consultations** — log worker consultation records (date, method, attendees, summary)
  - **Export** — one-click PDF: risk-level chart, action items ordered by urgency, the
    consultation log, and a state-specific compliance section, with the report preparer's name
    and credential (set on the Billing page)
- **Cryptographic sealing** — closing a case computes a SHA-256 hash of every hazard, action
  item, and consultation record (canonicalised so hash order never matters), and attempts to
  certify it via an independent RFC 3161 timestamp authority. The case becomes read-only once
  sealed; reopening clears the seal.
- **Dashboard** — open case files, high-risk hazard count, open/overdue action counts for the
  organisation, plus a nudge to complete the organisation profile if the state/territory is unset.
- **Billing** — Stripe Checkout + Billing Portal, plus the organisation profile and report
  preparer fields.

## Running it locally

Requires Node 22+ (uses the built-in `node:sqlite` module — no native build step).

```bash
# 1. Backend
cd server
cp .env.example .env      # edit JWT_SECRET; add Stripe keys later if you want billing live
npm install
npm run dev                # http://localhost:4000

# 2. Frontend (in a second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173, proxies /api to :4000
```

Open http://localhost:5173, sign up, and you're in. The SQLite database file is created
automatically at `server/connexus.db` on first run, seeded with the 22+ entry hazard library.

## Enabling Stripe billing

The `/api/checkout/*` endpoints work out of the box but return a "Stripe not configured" message
until you add real keys. Connexus has three pricing tiers — Starter ($89/mo, 1 seat), Growth
($179/mo, up to 3 seats), and Enterprise ($399/mo, up to 10 seats) — each backed by its own Stripe
Price:

1. In `server/.env`, set `STRIPE_SECRET_KEY` to your own Stripe secret key (never commit it, and
   don't paste it anywhere outside your own `.env`/hosting provider's environment settings).
2. Run `npm run setup:stripe` from `server/` (or `node scripts/setup-stripe-prices.mjs` directly).
   It creates the three Products/Prices in your Stripe account and prints the three price IDs.
3. Copy those into `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, and `STRIPE_PRICE_ENTERPRISE` in
   `server/.env` (or the Render dashboard for `connexus-api`), then redeploy the backend.
4. For subscription status and tier to update automatically, add a webhook endpoint pointing at
   `POST /api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`. The webhook keeps an org's
   `planTier` in sync with whichever tier's price it's actually subscribed to.

The Billing page's "Switch to X" buttons change an org's seat limit for free/instantly (used to
test the Team page's invite flow) and are independent of the "Subscribe — $X/mo" buttons, which
create a real Stripe Checkout session. There's no upgrade/downgrade-while-subscribed flow yet —
switching tiers while already paying currently needs the Stripe customer portal or a manual
subscription update.

## RFC 3161 timestamping

`POST /api/cases/:id/close` tries to certify the case's SHA-256 hash against
`process.env.TSA_URL` (defaults to `http://timestamp.digicert.com`). If the timestamp authority
is unreachable — common on some hosts/sandboxes — the seal still completes with
`sealTimestampAuthority: "local (RFC 3161 authority unreachable)"` so closing a case never fails
outright; the SHA-256 hash itself is always computed and stored.

## Deploying

This is currently deployed on Render as two services from the `sventer667/psychsafe-web` GitHub
repo:

- **Backend** (`connexus-api` service, live at `connexus-api-f5h7.onrender.com`) — Node web
  service, build command `cd server && npm install && npm run build`, start command
  `cd server && npm start`.
- **Frontend** (`connexus-app` static site, live at `connexus-app.onrender.com`) — build command
  `cd client && npm install && npm run build`, publish path `client/dist`, with `VITE_API_URL`
  set to the backend's `/api` URL.

Known gap: the backend service doesn't currently have a persistent disk attached, so the SQLite
database resets on every redeploy. Fix in the Render dashboard → the backend service → **Disks**
→ add a disk mounted at `/var/data`, then set `DATABASE_PATH=/var/data/connexus.db`.

To deploy elsewhere (Vercel/Netlify for the frontend, Railway/Fly.io for the backend), the same
build/start commands apply — just set `VITE_API_URL` on the frontend and the vars from
`server/.env.example` on the backend.

## Updating the live app

There's no GitHub integration wired up in this environment, so shipping a change is a manual
two-step:

1. Upload the changed files to the `sventer667/psychsafe-web` GitHub repo (web UI drag-and-drop,
   or `git push` if you have it set up locally).
2. Trigger a redeploy of both Render services from the dashboard (or ask Claude to do it via the
   Render connector).

## Project layout notes

Connexus started as a consultant tool where one login managed multiple "Client" businesses, each
with their own case files. It's since moved to a direct self-service model — each signed-up
Organization manages its own psychosocial risks, with industry/state/business unit living on
`organizations` instead of a separate `clients` table. A number of files from that earlier model
are retired stubs, left in place (not deleted, not routed to/mounted) because this environment
can't delete files once written:

- `client/src/pages/Clients.tsx`, `RiskRegister.tsx`, `PreventionPlans.tsx`, `SignOffQueue.tsx`,
  `ManagementReport.tsx`, `components/Sidebar.tsx`, `context/ClientContext.tsx`
- `server/src/routes/clients.ts`, `preventionPlans.ts`, `signOffs.ts`

The current model: Organization → Cases → Hazards / Action Items / Consultations. Ownership
checks (`ownsCase`) go straight from the JWT's `orgId` to `cases.orgId`, no join required.
