import { Router } from 'express'
import { db } from '../db.js'
import { sendEmail } from '../email.js'

// Public contact and support form. Submissions are saved to the database
// first, so nothing is lost if the email service is down or not configured.
export const contactRouter = Router()

const NOTIFY_TO = process.env.CONTACT_NOTIFY_TO || 'contact@humanora.com.au'

const WHO = ['An existing Humanora client', 'Considering Humanora', 'Other']
const TOPICS = [
  'Sales enquiry or demo request',
  'Signing in or password reset',
  'Two-factor authentication',
  'Team members and seats',
  'Subscription and billing',
  'Assessments and reports',
  'Sealing or reopening an assessment',
  'Hazard library or legislation content',
  'Privacy or data request',
  'Security concern',
  'Something else',
]
const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT', 'Multiple']

db.exec(`
  CREATE TABLE IF NOT EXISTS contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    organisation TEXT NOT NULL DEFAULT '',
    who TEXT NOT NULL,
    topic TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    emailSent INTEGER NOT NULL DEFAULT 0,
    confirmationSent INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

// Simple in-memory limits: 5 submissions per IP and 3 per email address per hour.
const WINDOW_MS = 60 * 60 * 1000
const hits = new Map<string, number[]>()
function limited(key: string, max: number): boolean {
  const now = Date.now()
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= max) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.set(key, recent)
  return false
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : ''
}

contactRouter.post('/', async (req, res) => {
  const body = req.body || {}

  // Hidden spam trap: real visitors leave this empty. Pretend success to bots.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return res.json({ ok: true })
  }

  const name = clean(body.name, 120)
  const email = clean(body.email, 200).toLowerCase()
  const organisation = clean(body.organisation, 200)
  const who = clean(body.who, 60)
  const topic = clean(body.topic, 80)
  const state = clean(body.state, 20)
  const message = clean(body.message, 2000)

  if (!name) return res.status(400).json({ error: 'Please enter your name.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' })
  if (!WHO.includes(who)) return res.status(400).json({ error: 'Please choose who you are.' })
  if (!TOPICS.includes(topic)) return res.status(400).json({ error: 'Please choose what you need help with.' })
  if (state && !STATES.includes(state)) return res.status(400).json({ error: 'Please choose a valid state or territory.' })
  if (!message) return res.status(400).json({ error: 'Please enter a message.' })

  const fwd = req.get('x-forwarded-for')
  const ip = (fwd ? fwd.split(',')[0].trim() : req.ip) || 'unknown'
  if (limited(`ip:${ip}`, 5) || limited(`email:${email}`, 3)) {
    return res.status(429).json({ error: 'Too many messages from this address. Please try again later.' })
  }

  const result = db
    .prepare('INSERT INTO contact_requests (name, email, organisation, who, topic, state, message) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(name, email, organisation, who, topic, state, message)
  const id = Number(result.lastInsertRowid)

  // Notification to the Humanora inbox.
  const notifyHtml = `
    <p><strong>New contact request #${id}</strong></p>
    <p><strong>Topic:</strong> ${esc(topic)}<br />
    <strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;<br />
    <strong>I am:</strong> ${esc(who)}<br />
    <strong>Organisation:</strong> ${esc(organisation) || 'Not given'}<br />
    <strong>State or territory:</strong> ${esc(state) || 'Not given'}</p>
    <p style="white-space:pre-wrap">${esc(message)}</p>
    <p style="color:#64748B;font-size:12px">Reply to this sender at ${esc(email)}.</p>`
  const notify = await sendEmail({ to: NOTIFY_TO, subject: `[Contact] ${topic} from ${name}`, html: notifyHtml })

  // Confirmation to the sender.
  const confirmHtml = `
    <p>Hello ${esc(name)},</p>
    <p>Thank you for contacting Humanora. We have received your message and will reply to this email address within 1 to 3 business days, depending on the priority of your request.</p>
    <p><strong>Topic:</strong> ${esc(topic)}</p>
    <p style="white-space:pre-wrap;border-left:3px solid #0E7C66;padding-left:12px;color:#334155">${esc(message)}</p>
    <p>Our support hours are Monday to Friday, 9:00 am to 5:00 pm Australian Eastern time. You can read more in our <a href="https://humanora.com.au/support">Support Policy</a>.</p>
    <p>Regards,<br />Humanora<br />contact@humanora.com.au | humanora.com.au</p>`
  const confirm = await sendEmail({ to: email, subject: 'We have received your message | Humanora', html: confirmHtml })

  db.prepare('UPDATE contact_requests SET emailSent = ?, confirmationSent = ? WHERE id = ?').run(
    notify.sent ? 1 : 0,
    confirm.sent ? 1 : 0,
    id
  )

  res.json({ ok: true })
})
