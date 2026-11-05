import { db } from './db.js'
import { sendEmail } from './email.js'

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}

// Emails an invite link to the invitee. Never throws; the invite still exists
// (and its link can still be copied by hand) if the email can't be sent.
export async function sendInviteEmail(opts: {
  orgId: number
  inviterId: number
  name: string
  email: string
  token: string
}): Promise<boolean> {
  try {
    const org = db.prepare('SELECT name FROM organizations WHERE id = ?').get(opts.orgId) as { name: string } | undefined
    const inviter = db.prepare('SELECT name FROM users WHERE id = ?').get(opts.inviterId) as { name: string } | undefined
    const appUrl = (process.env.APP_URL || process.env.CLIENT_URL || 'https://humanora.com.au').replace(/\/$/, '')
    const link = `${appUrl}/invite/${opts.token}`
    const orgName = org?.name || 'an organisation'
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a2433">
<h2 style="margin:0 0 12px">You've been invited to Humanora</h2>
<p>Hi ${esc(opts.name)},</p>
<p>${esc(inviter?.name || 'A colleague')} has invited you to join <strong>${esc(orgName)}</strong> on Humanora, a workplace psychosocial risk management tool.</p>
<p style="margin:20px 0"><a href="${link}" style="background:#0f7b64;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Accept invitation</a></p>
<p>This link works once and expires in 7 days. If you weren't expecting this, you can ignore this email.</p>
<p style="color:#6b7686;font-size:12px">Humanora, ABN 80 423 515 887 · contact@humanora.com.au</p>
</div>`
    const r = await sendEmail({ to: opts.email, subject: `${inviter?.name || 'Someone'} invited you to ${orgName} on Humanora`, html })
    return r.sent
  } catch (err) {
    console.error('[invite-email] failed', err)
    return false
  }
}
