import { db } from './db.js'
import { sendEmail } from './email.js'
import { TIER_COPY } from './routes/gapCheck.js'

// Opt-in email sequence for Gap Check leads (Spam Act 2003).
//
// Only leads with marketingConsent = 1 and no unsubscribedAt are ever
// emailed. Leads created before consent was collected have marketingConsent
// = 0 and are never sent anything here.
//
// Off by default. Set NURTURE_ENABLED=true to send. With NURTURE_ENABLED=
// dryrun it only logs who would be emailed.

const STEPS = [
  { day: 2, key: 'email1' },
  { day: 4, key: 'email2' },
  { day: 7, key: 'email3' },
  { day: 11, key: 'email4' },
  { day: 16, key: 'email5' },
]

const INK = '#0f2a35'
const MUTED = '#4a5a66'
const ACCENT = '#0f6e6e'
const BORDER = '#e2e8ea'
const MAX_PER_RUN = 50

interface Lead {
  id: number
  email: string
  firstName: string
  state: string
  tier: keyof typeof TIER_COPY
  nurtureStep: number
  unsubscribeToken: string
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

function appUrl(): string {
  return (process.env.APP_URL || 'https://humanora.com.au').replace(/\/$/, '')
}

function trialLink(content: string): string {
  return `${appUrl()}/signup?utm_source=email&utm_medium=email&utm_campaign=nurture&utm_content=${content}`
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${href}" style="background:${ACCENT};color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">${label}</a></p>`
}

function ul(items: string[]): string {
  return `<ol style="color:${INK};">${items.map((i) => `<li>${i}</li>`).join('')}</ol>`
}

function build(key: string, lead: Lead): { subject: string; body: string } {
  const name = lead.firstName ? esc(lead.firstName) : ''
  const hi = name ? `Hi ${name},` : 'Hi,'
  const state = esc(lead.state)
  const tier = esc(TIER_COPY[lead.tier]?.label || '')
  const pdf = `${process.env.API_URL || 'https://api.humanora.com.au'}/api/gap-check/${lead.id}/pdf`

  switch (key) {
    case 'email1':
      return {
        subject: name ? `What your Gap Check result means, ${lead.firstName}` : 'What your Gap Check result means',
        body: `<p>${hi}</p>
<p>Your Humanora Gap Check result was "${tier}". That is a starting point, not a verdict.</p>
<p>Three things you can do this week, no software needed:</p>
${ul([
  'Write down the hazards you already know about in your workplace (workload, role clarity, support, behaviour, remote work).',
  'Note the last time you asked workers about them, and how.',
  'Find where any actions were recorded and who owns them.',
])}
<p>Where those three answers are hard to find, that is where a regulator would look too.</p>
<p>Your PDF has the legislation for ${state}: <a href="${pdf}">download it again</a>.</p>`,
      }
    case 'email2':
      return {
        subject: 'What "good evidence" looks like',
        body: `<p>${hi}</p>
<p>A strong psychosocial risk record answers four things: what the hazard is, how serious it is, what you did about it, and who was consulted.</p>
<p>In Humanora, each hazard is rated, each action has an owner and a due date, and consultation is logged. When you close the assessment, it is sealed so the record cannot be quietly changed afterwards.</p>
<p>You can see the whole thing in a 7-day free trial.</p>
${button(trialLink('email2'), 'Start your free trial')}`,
      }
    case 'email3':
      return {
        subject: 'Try it on one real hazard',
        body: `<p>${hi}</p>
<p>The fastest way to judge a tool is to use it on something real. Pick one hazard that is already on your mind, such as workload or role clarity, and run it through Humanora:</p>
<ul style="color:${INK};"><li>add it from the library,</li><li>rate it,</li><li>assign one action,</li><li>export the PDF.</li></ul>
<p>Most people can do that in one sitting.</p>
${button(trialLink('email3'), 'Start your 7-day free trial')}`,
      }
    case 'email4':
      return {
        subject: '"We are too small for this"',
        body: `<p>${hi}</p>
<p>Small teams often assume psychosocial risk is a big-company problem. The duty to manage it applies to businesses of every size.</p>
<p>A small team needs a small process: a short list of hazards, a few owned actions and a record you can find. That is what the Starter plan ($89 a month, one seat) is for. Pay annually and you get 12 months for the price of 11. Prices are in AUD, with no GST.</p>
${button(trialLink('email4'), 'Start free for 7 days')}`,
      }
    default:
      return {
        subject: 'Last note from us',
        body: `<p>${hi}</p>
<p>This is the last email in this series. Your Gap Check result and PDF are still yours to use, with or without Humanora.</p>
<p>If you would like a hand getting set up, reply to this email. For Enterprise plans we load your sites, teams and starting hazards for you.</p>`,
      }
  }
}

function wrap(body: string, token: string): string {
  const unsub = `${appUrl()}/unsubscribe?token=${encodeURIComponent(token)}`
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:${INK};line-height:1.5;">
${body}
<p>Humanora</p>
<hr style="border:none;border-top:1px solid ${BORDER};margin:32px 0 12px;"/>
<p style="font-size:12px;color:${MUTED};">Humanora, ABN 80 423 515 887 · contact@humanora.com.au<br/>
You're receiving this because you ticked the box to get tips and updates when you completed the Humanora Gap Check.
<a href="${unsub}">Unsubscribe</a> at any time. <a href="${appUrl()}/privacy">Privacy policy</a>.</p>
</div>`
}

export interface NurtureResult {
  mode: string
  due: number
  sent: number
  failed: number
}

export async function runNurture(): Promise<NurtureResult> {
  const mode = (process.env.NURTURE_ENABLED || '').toLowerCase()
  const dry = mode === 'dryrun'
  if (mode !== 'true' && !dry) return { mode: 'off', due: 0, sent: 0, failed: 0 }

  const result: NurtureResult = { mode: dry ? 'dryrun' : 'live', due: 0, sent: 0, failed: 0 }

  for (let idx = 0; idx < STEPS.length; idx++) {
    const step = STEPS[idx]
    const leads = db
      .prepare(
        `SELECT id, email, firstName, state, tier, nurtureStep, unsubscribeToken
         FROM gap_check_leads
         WHERE marketingConsent = 1
           AND unsubscribedAt IS NULL
           AND unsubscribeToken IS NOT NULL
           AND nurtureStep = ?
           AND julianday('now') - julianday(COALESCE(consentAt, createdAt)) >= ?
           AND (lastNurtureAt IS NULL OR julianday('now') - julianday(lastNurtureAt) >= 1)
         ORDER BY id
         LIMIT ?`,
      )
      .all(idx, step.day, MAX_PER_RUN) as unknown as Lead[]

    for (const lead of leads) {
      result.due++
      if (dry) {
        console.log(`[nurture] dryrun: would send ${step.key} to lead ${lead.id}`)
        continue
      }
      const { subject, body } = build(step.key, lead)
      const r = await sendEmail({ to: lead.email, subject, html: wrap(body, lead.unsubscribeToken) })
      if (r.sent) {
        db.prepare("UPDATE gap_check_leads SET nurtureStep = ?, lastNurtureAt = datetime('now') WHERE id = ?").run(idx + 1, lead.id)
        result.sent++
      } else {
        result.failed++
      }
    }
  }

  console.log(`[nurture] ${JSON.stringify(result)}`)
  return result
}

export function startNurtureScheduler(): void {
  const mode = (process.env.NURTURE_ENABLED || '').toLowerCase()
  if (mode !== 'true' && mode !== 'dryrun') {
    console.log('[nurture] disabled (set NURTURE_ENABLED=true to send, or dryrun to preview)')
    return
  }
  console.log(`[nurture] scheduler started (mode: ${mode})`)
  const tick = () => runNurture().catch((e) => console.error('[nurture] run failed:', e))
  setTimeout(tick, 60_000)
  setInterval(tick, 6 * 60 * 60 * 1000)
}
