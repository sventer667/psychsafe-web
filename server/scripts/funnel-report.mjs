// Read-only funnel report: Gap Check leads and signups by source.
// Usage on the droplet:  cd /opt/humanora/server && node scripts/funnel-report.mjs
// Opens the database read-only and prints counts only (no email addresses).
import { DatabaseSync } from 'node:sqlite'

const DB_PATH = process.env.DATABASE_PATH || '/var/lib/humanora/humanora.db'
const db = new DatabaseSync(DB_PATH, { readOnly: true })

// A visitor's source: the campaign tag if there was one, else the referring site, else direct.
const SOURCE = "COALESCE(NULLIF(utmSource, ''), NULLIF(referrerHost, ''), 'direct')"

const totals = db
  .prepare(
    `SELECT COUNT(*) AS leads,
            SUM(CASE WHEN convertedOrgId IS NOT NULL THEN 1 ELSE 0 END) AS leadsThenSignedUp
     FROM gap_check_leads`
  )
  .get()
console.log('\nGap Check leads (all time)')
console.table([totals])

console.log('Gap Check leads by source and campaign')
console.table(
  db
    .prepare(
      `SELECT ${SOURCE} AS source,
              COALESCE(NULLIF(utmCampaign, ''), '-') AS campaign,
              COALESCE(NULLIF(ctaContent, ''), '-') AS ctaContent,
              COUNT(*) AS leads,
              SUM(CASE WHEN convertedOrgId IS NOT NULL THEN 1 ELSE 0 END) AS signedUp
       FROM gap_check_leads
       GROUP BY 1, 2, 3
       ORDER BY leads DESC`
    )
    .all()
)

console.log('Signups (organisations) by source')
console.table(
  db
    .prepare(
      `SELECT ${SOURCE} AS source,
              COALESCE(NULLIF(utmCampaign, ''), '-') AS campaign,
              COUNT(*) AS signups,
              SUM(CASE WHEN planStatus = 'trialing' THEN 1 ELSE 0 END) AS trialing,
              SUM(CASE WHEN planStatus = 'active' THEN 1 ELSE 0 END) AS paid
       FROM organizations
       GROUP BY 1, 2
       ORDER BY signups DESC`
    )
    .all()
)
console.log('Rows before source tracking was added show as "direct". Paid = Stripe status "active".\n')
