import { Resend } from 'resend'

// Transactional email via Resend. RESEND_API_KEY and EMAIL_FROM are not set
// up in any environment yet (the Resend account and connexusohs.com.au DNS
// verification are a manual, one-time step only a human can do). Until then,
// this logs and no-ops instead of throwing, so features that send email
// (currently just the gap-check results email) degrade gracefully rather
// than crashing the request that triggered them.
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const EMAIL_FROM = process.env.EMAIL_FROM || 'Connexus <onboarding@resend.dev>'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export interface SendEmailInput {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<{ sent: boolean; error?: string }> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set, skipping send to ${to}: "${subject}"`)
    return { sent: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    })

    if (result.error) {
      console.error(`[email] Resend rejected send to ${to}:`, result.error)
      return { sent: false, error: result.error.message }
    }

    return { sent: true }
  } catch (err) {
    console.error(`[email] Failed to send to ${to}:`, err)
    return { sent: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
