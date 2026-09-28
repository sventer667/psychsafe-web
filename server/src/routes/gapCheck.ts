import { Router } from 'express'
import PDFDocument from 'pdfkit'
import { db } from '../db.js'
import { sendEmail } from '../email.js'

// Public, unauthenticated router. Unlike reports.ts (which requires a logged
// in user who owns the case), the gap-check quiz is answered by anonymous
// visitors who haven't created an account, so there is deliberately no
// requireAuth/requireTrialActive/ownsCase here.
export const gapCheckRouter = Router()

// Same palette as reports.ts, kept in sync manually since this is a separate
// public route rather than an extension of the authed reports router.
const INK = '#16213A'
const MUTED = '#64748B'
const ACCENT = '#0E7C66'
const DESTRUCTIVE = '#DC2626'
const ALERT = '#D97706'
const SUCCESS = '#16A34A'
const BORDER = '#DCE1E8'

const STEP3_QUESTIONS = [
  'Do you have a documented register of specific psychosocial hazards, not just a general policy?',
  'For each hazard, is there something dated behind the rating (an incident, a survey result, or consultation feedback) rather than just a number someone assigned?',
  'Are your controls assigned to a named person with a due date, and could you say right now which ones are overdue?',
  'Have you consulted with workers or their representatives about these risks, and kept a record of it?',
  'Has any of this been reviewed or reassessed in the last 12 months?',
  'If an inspector asked today, could you hand over something dated and specific within five minutes?',
]

// Shared verbatim between the results email and the PDF, per
// gap-check-email-pdf-content.md. Index matches STEP3_QUESTIONS.
const GAP_CARDS = [
  {
    title: 'No documented hazard register',
    missing: 'A documented register of your specific psychosocial hazards, rather than a general policy statement.',
    why: "A policy that says you take this seriously isn't itself evidence you've done the work. Regulators ask for hazards, ratings, and controls, not intentions.",
    good: 'Each hazard your organisation actually faces, named, rated, and tracked in one place.',
  },
  {
    title: 'No dated evidence behind ratings',
    missing: 'Something dated behind each rating, an incident, a survey result, consultation feedback, rather than just a number someone assigned.',
    why: 'A rating with no basis is a guess. If asked how you arrived at it, "someone\'s judgement" doesn\'t hold up the way a dated, specific source does.',
    good: 'Each hazard citing what told you it was a risk, and when.',
  },
  {
    title: 'No named owners or due dates on controls',
    missing: 'Controls assigned to a named person with a due date.',
    why: "A control nobody owns is a control that quietly doesn't happen. Overdue items need to be visible, not buried in a document.",
    good: 'Every control assigned, dated, and its status known at a glance.',
  },
  {
    title: 'No consultation record',
    missing: 'A record that you consulted workers or their representatives about these risks.',
    why: 'Consultation is a legislated requirement, not a nice to have. No record means no proof it happened, even if it did.',
    good: 'Dates, methods, attendees, and outcomes logged against the assessment they relate to.',
  },
  {
    title: 'No review in the last 12 months',
    missing: 'A review or reassessment within the last 12 months.',
    why: "Psychosocial risk changes as your workplace does. A record that hasn't moved in over a year reads as abandoned, not maintained.",
    good: 'A set review cadence, with reminders, so nothing goes stale without anyone noticing.',
  },
  {
    title: "Couldn't produce something on short notice",
    missing: 'Something dated and specific you could actually hand over within five minutes.',
    why: "This is the one that gets tested in practice. If it takes days to assemble, it isn't really a system, it's an archaeology project.",
    good: 'One place, always current, exportable in a click.',
  },
]

// Reused across the site (compare client/src/pages/SectorGuide.tsx / Home.tsx).
// Kept here as a hardcoded map for now rather than shared imports since the
// server and client don't currently share a content module; consolidating
// this into one source is a follow-up, noted in gap-check-email-pdf-content.md.
const INDUSTRY_HAZARDS: Record<string, string[]> = {
  Construction: [
    'Job insecurity from short-term and subcontracted engagements',
    'Isolation of subcontractors and sole traders from the main workforce',
    'High physical injury exposure compounding psychological stress',
    'Fatigue from extended hours and project deadline pressure',
  ],
  Education: [
    'Emotionally demanding student behaviour management',
    'Chronic understaffing and excessive workload outside teaching hours',
    'Conflict with parents and carers',
    'Exposure to aggression or violence from students',
  ],
  'Emergency Services': [
    'Repeated exposure to traumatic incidents',
    'Shift work and fatigue from irregular rostering',
    'High-stakes, time-critical decision making',
    'Cumulative stress from sustained operational demand',
  ],
  'Healthcare & Aged Care': [
    'Chronic understaffing relative to patient or resident load',
    'Patient or resident aggression and challenging behaviours',
    'Emotionally demanding care work, including end-of-life care',
    'Fatigue from extended shifts and on-call demands',
  ],
  'Mining & Resources': [
    'Isolation from fly-in fly-out and remote site arrangements',
    'Fatigue from extended rosters and shift patterns',
    'High-risk physical environment adding to psychological load',
    'Limited access to support services while on site',
  ],
  'Transport & Logistics': [
    'Fatigue from long-haul and irregular-hours driving',
    'Isolation for solo and long-distance workers',
    'Customer or public aggression',
    'Pressure from tight delivery windows',
  ],
  Other: [
    'Excessive workload or unreasonable time pressure',
    'Low job control and unclear role expectations',
    'Poor support from supervisors or peers',
    'Exposure to conflict, aggression, or bullying',
  ],
}

type Tier = 'solid' | 'partial' | 'high'

function computeTier(answers: boolean[]): Tier {
  const noCount = answers.filter((a) => a === false).length
  if (noCount <= 1) return 'solid'
  if (noCount <= 4) return 'partial'
  return 'high'
}

const TIER_COPY: Record<Tier, { label: string; headline: string; body: string }> = {
  solid: {
    label: 'Solid foundation, one gap worth closing',
    headline: 'Solid foundation, one gap worth closing',
    body: "You're doing more than most organisations we see. There's one area that could use attention before it becomes a problem. We've included it in your full breakdown below.",
  },
  partial: {
    label: 'Partial coverage, several gaps to close',
    headline: 'Partial coverage, several gaps to close',
    body: 'You have some of what\'s expected, but there are real gaps that would likely surface under any real scrutiny. Your full breakdown below shows exactly what\'s missing and why it matters.',
  },
  high: {
    label: 'High exposure, no defensible record right now',
    headline: 'High exposure, no defensible record right now',
    body: "Based on your answers, you don't currently have something that would hold up if asked. That's a common starting point, not a verdict on your organisation, and it's fixable. Your full breakdown shows exactly where to start.",
  },
}

function getLegislationForState(state: string): string {
  try {
    const row = db.prepare('SELECT legislation FROM hazard_library LIMIT 1').get() as { legislation: string } | undefined
    if (!row) return ''
    const parsed = JSON.parse(row.legislation)
    return parsed[state] || ''
  } catch {
    return ''
  }
}

function buildResultsEmailHtml(input: {
  firstName: string
  industry: string
  state: string
  tier: Tier
  gapIndices: number[]
  id: number
}): string {
  const { firstName, industry, state, tier, gapIndices, id } = input
  const tierCopy = TIER_COPY[tier]
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,'
  const legislation = getLegislationForState(state)
  const hazards = INDUSTRY_HAZARDS[industry] || INDUSTRY_HAZARDS.Other

  const gapCardsHtml = gapIndices.length
    ? gapIndices
        .map((i) => {
          const g = GAP_CARDS[i]
          return `
            <div style="margin-bottom:20px;padding:16px 0;border-top:1px solid ${BORDER};">
              <p style="margin:0 0 6px;font-weight:600;color:${INK};">${g.title}</p>
              <p style="margin:0 0 4px;color:${MUTED};"><strong>What's missing:</strong> ${g.missing}</p>
              <p style="margin:0 0 4px;color:${MUTED};"><strong>Why it matters:</strong> ${g.why}</p>
              <p style="margin:0;color:${MUTED};"><strong>What good looks like:</strong> ${g.good}</p>
            </div>`
        })
        .join('')
    : `<p style="color:${MUTED};">You answered yes to all six. The main risk now is letting this drift, not lacking it in the first place. A set review cadence is the one thing worth adding.</p>`

  const appUrl = process.env.APP_URL || 'https://connexus-app.onrender.com'
  const pdfUrl = `${process.env.API_URL || 'https://connexus-api-f5h7.onrender.com'}/api/gap-check/${id}/pdf`

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:${INK};">
      <p>${greeting}</p>
      <p>Here's your result from the gap check: <strong>${tierCopy.label}</strong>.</p>
      <p>${tierCopy.body}</p>
      <p>Here's exactly what we found, based on your answers:</p>
      ${gapCardsHtml}
      <h3 style="margin-top:28px;">What this looks like for ${industry} specifically</h3>
      <ul style="color:${MUTED};">
        ${hazards.map((h) => `<li>${h}</li>`).join('')}
      </ul>
      ${legislation ? `<h3>What ${state} requires</h3><p style="color:${MUTED};">${legislation}</p>` : ''}
      <h3 style="margin-top:28px;">Next step</h3>
      <p>You don't need to fix all of this in a spreadsheet. Start a free 7-day trial and we'll pre-load your hazard register with the gaps we just found for ${industry} in ${state}.</p>
      <p style="margin:24px 0;">
        <a href="${appUrl}/signup" style="background:${ACCENT};color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Start your free trial</a>
      </p>
      <p style="color:${MUTED};">No credit card required.</p>
      <p style="color:${MUTED};">Prefer to keep looking around first? <a href="${pdfUrl}">Your full breakdown (PDF)</a>.</p>
      <p>Thanks,<br/>The Connexus team</p>
      <hr style="border:none;border-top:1px solid ${BORDER};margin:32px 0 12px;"/>
      <p style="font-size:12px;color:${MUTED};">
        You're receiving this because you completed the psychosocial risk gap check at Connexus.
        <a href="${appUrl}/privacy">Privacy policy</a>.
      </p>
    </div>
  `
}

gapCheckRouter.post('/', async (req, res) => {
  const { email, firstName, state, industry, orgSize, answers } = req.body || {}

  if (typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' })
  }
  if (typeof state !== 'string' || !state) {
    return res.status(400).json({ error: 'State or territory is required.' })
  }
  if (typeof industry !== 'string' || !industry) {
    return res.status(400).json({ error: 'Industry is required.' })
  }
  if (typeof orgSize !== 'string' || !orgSize) {
    return res.status(400).json({ error: 'Organisation size is required.' })
  }
  if (!Array.isArray(answers) || answers.length !== 6 || !answers.every((a) => typeof a === 'boolean')) {
    return res.status(400).json({ error: 'Six yes/no answers are required.' })
  }

  const tier = computeTier(answers)

  const result = db
    .prepare(
      `INSERT INTO gap_check_leads (email, firstName, state, industry, orgSize, answers, tier)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(email, firstName || '', state, industry, orgSize, JSON.stringify(answers), tier)

  const id = Number(result.lastInsertRowid)
  const gapIndices = answers.reduce<number[]>((acc, a, i) => {
    if (a === false) acc.push(i)
    return acc
  }, [])

  const html = buildResultsEmailHtml({ firstName: firstName || '', industry, state, tier, gapIndices, id })

  // Fire the email but don't fail the request if it doesn't send (e.g. no
  // RESEND_API_KEY configured yet) — the visitor still gets their on-screen
  // result and the PDF link either way.
  sendEmail({
    to: email,
    subject: `Your psychosocial risk gap check result for ${industry} in ${state}`,
    html,
  }).catch((err) => console.error('[gap-check] email send threw:', err))

  res.status(201).json({
    id,
    tier,
    tierLabel: TIER_COPY[tier].label,
    pdfUrl: `/api/gap-check/${id}/pdf`,
  })
})

gapCheckRouter.get('/:id/pdf', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  const lead = db.prepare('SELECT * FROM gap_check_leads WHERE id = ?').get(id) as
    | {
        id: number
        email: string
        firstName: string
        state: string
        industry: string
        orgSize: string
        answers: string
        tier: Tier
        createdAt: string
      }
    | undefined

  if (!lead) {
    return res.status(404).json({ error: 'Not found' })
  }

  const answers: boolean[] = JSON.parse(lead.answers)
  const gapIndices = answers.reduce<number[]>((acc, a, i) => {
    if (a === false) acc.push(i)
    return acc
  }, [])
  const tierCopy = TIER_COPY[lead.tier]
  const legislation = getLegislationForState(lead.state)
  const hazards = INDUSTRY_HAZARDS[lead.industry] || INDUSTRY_HAZARDS.Other

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="connexus-gap-check-${lead.id}.pdf"`)

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  doc.pipe(res)

  // Cover
  doc.fontSize(22).fillColor(INK).text('Your psychosocial risk gap check', { align: 'left' })
  doc.moveDown(0.3)
  doc.fontSize(12).fillColor(MUTED).text(`${lead.industry} · ${lead.state} · ${lead.orgSize} people`)
  doc.moveDown(0.6)
  doc
    .fontSize(11)
    .fillColor('#fff')
    .rect(doc.x, doc.y, 220, 26)
    .fill(lead.tier === 'high' ? DESTRUCTIVE : lead.tier === 'partial' ? ALERT : SUCCESS)
  doc.fillColor('#fff').text(tierCopy.label, doc.x + 10, doc.y - 20, { width: 200 })
  doc.fillColor(MUTED).fontSize(9).moveDown(2.2).text(`Generated ${new Date(lead.createdAt).toLocaleDateString('en-AU')}`)

  doc.moveDown(1.5)
  doc.fontSize(16).fillColor(INK).text('Your result')
  doc.moveDown(0.3)
  doc.fontSize(11).fillColor(MUTED).text(tierCopy.body, { width: 495 })

  doc.moveDown(1.2)
  doc.fontSize(16).fillColor(INK).text('What we checked')
  doc.moveDown(0.3)
  STEP3_QUESTIONS.forEach((q, i) => {
    const answered = answers[i]
    doc
      .fontSize(10)
      .fillColor(answered ? SUCCESS : DESTRUCTIVE)
      .text(answered ? 'Yes' : 'No', { continued: true, width: 495 })
    doc.fillColor(INK).text(`  ${q}`, { width: 465 })
    doc.moveDown(0.4)
  })

  doc.moveDown(0.8)
  doc.fontSize(16).fillColor(INK).text('The gaps we found')
  doc.moveDown(0.3)
  if (gapIndices.length === 0) {
    doc
      .fontSize(11)
      .fillColor(MUTED)
      .text(
        'You answered yes to all six. The main risk now is letting this drift, not lacking it in the first place. A set review cadence is the one thing worth adding.',
        { width: 495 }
      )
  } else {
    gapIndices.forEach((i) => {
      const g = GAP_CARDS[i]
      if (doc.y > 680) doc.addPage()
      doc.fontSize(12).fillColor(INK).text(g.title, { width: 495 })
      doc.fontSize(10).fillColor(MUTED).text(`What's missing: ${g.missing}`, { width: 495 })
      doc.fontSize(10).fillColor(MUTED).text(`Why it matters: ${g.why}`, { width: 495 })
      doc.fontSize(10).fillColor(MUTED).text(`What good looks like: ${g.good}`, { width: 495 })
      doc.moveDown(0.6)
    })
  }

  if (doc.y > 620) doc.addPage()
  doc.moveDown(0.8)
  doc.fontSize(16).fillColor(INK).text(`Hazards common in ${lead.industry}`)
  doc.moveDown(0.3)
  hazards.forEach((h) => {
    doc.fontSize(10).fillColor(MUTED).text(`•  ${h}`, { width: 495 })
  })

  if (legislation) {
    doc.moveDown(0.8)
    doc.fontSize(16).fillColor(INK).text(`What ${lead.state} requires`)
    doc.moveDown(0.3)
    doc.fontSize(10).fillColor(MUTED).text(legislation, { width: 495 })
  }

  doc.moveDown(1.2)
  doc.fontSize(16).fillColor(INK).text('Suggested next step')
  doc.moveDown(0.3)
  doc
    .fontSize(11)
    .fillColor(MUTED)
    .text(
      `Start your free 7-day trial. We'll pre-load your hazard register with ${lead.industry} hazards, apply ${lead.state} legislation automatically, and mark the gaps above as the first things to address.`,
      { width: 495 }
    )

  doc.moveDown(1.5)
  doc
    .fontSize(8)
    .fillColor(MUTED)
    .text(
      'Generated by Connexus. This is a self-assessment based on your own answers, not a legal opinion or formal audit.',
      { width: 495 }
    )

  doc.end()
})
