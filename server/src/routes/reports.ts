import { Router } from 'express'
import PDFDocument from 'pdfkit'
import { db } from '../db.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { ownsCase } from '../ownership.js'
import { requireTrialActive } from '../trialGate.js'

export const reportsRouter = Router()
reportsRouter.use(requireAuth)
reportsRouter.use(requireTrialActive)

// Matches the app's navy/teal brand (see client/src/index.css) rather than
// the warm gold/cream palette this report used when the app's UI matched
// psychosocialguard.com.au's theme.
const INK = '#16213A'
const MUTED = '#64748B'
const ACCENT = '#0E7C66'
const DESTRUCTIVE = '#DC2626'
const ALERT = '#D97706'
const SUCCESS = '#16A34A'
const BORDER = '#DCE1E8'

function riskColor(rating: number) {
  if (rating >= 12) return DESTRUCTIVE
  if (rating >= 6) return ALERT
  return SUCCESS
}

reportsRouter.get('/case/:id', async (req: AuthedRequest, res) => {
  const caseId = Number(req.params.id)
  if (!ownsCase(req.auth!.orgId, caseId)) return res.status(404).json({ error: 'Assessment not found' })

  const caseRow = db.prepare('SELECT * FROM cases WHERE id = ?').get(caseId) as any
  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.auth!.orgId) as any
  const sealHistory = db
    .prepare('SELECT * FROM case_seal_events WHERE caseId = ? ORDER BY createdAt ASC, id ASC')
    .all(caseId) as any[]
  const hazards = db.prepare('SELECT * FROM hazards WHERE caseId = ? ORDER BY riskRating DESC').all(caseId) as any[]
  const actionItems = db.prepare('SELECT * FROM action_items WHERE caseId = ?').all(caseId) as any[]
  const consultations = db.prepare('SELECT * FROM consultations WHERE caseId = ? ORDER BY date DESC').all(caseId) as any[]

  const today = new Date(new Date().toDateString())
  const sortedActions = [...actionItems].sort((a, b) => {
    const aOverdue = a.dueDate && !['complete', 'closed'].includes(a.status) && new Date(a.dueDate) < today
    const bOverdue = b.dueDate && !['complete', 'closed'].includes(b.status) && new Date(b.dueDate) < today
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${(org.name || 'assessment').replace(/[^a-z0-9]/gi, '-')}-report.pdf"`)

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  doc.pipe(res)

  // --- Title page ---
  doc.fontSize(10).fillColor(MUTED).text((org.name || 'Connexus').toUpperCase(), { characterSpacing: 1 })
  doc.moveDown(2)
  doc.fontSize(26).fillColor(INK).text('Psychosocial Risk Assessment Report', { width: 480 })
  doc.moveDown(0.5)
  doc.fontSize(14).fillColor(ACCENT).text(caseRow.name)
  doc.moveDown(1.5)

  doc.fontSize(10).fillColor(MUTED)
  doc.text(`Assessment: ${caseRow.name}`)
  doc.text(`Status: ${caseRow.status}${caseRow.status === 'closed' ? ` (sealed ${caseRow.sealTimestampTime ?? ''})` : ''}`)
  doc.text(`Industry: ${org.industry || '—'}    State/Territory: ${caseRow.state || org.state || '—'}`)
  if (org.consultantName) doc.text(`Prepared by: ${org.consultantName}${org.consultantCredential ? ` (${org.consultantCredential})` : ''}`)
  doc.text(`Report generated: ${new Date().toLocaleString()}`)

  if (caseRow.sealHash) {
    doc.moveDown(1)
    doc.fontSize(9).fillColor(MUTED).text(`SHA-256 seal: ${caseRow.sealHash}`)
    doc.text(`Timestamp authority: ${caseRow.sealTimestampAuthority ?? '—'}`)
  }

  // A case that's been reopened and resealed no longer shows its full history
  // in the sealHash/sealTimestamp columns above (those only ever hold the
  // *current* seal), so surface the full audit trail here: every prior seal
  // that was broken, by whom, when, and why, so the report doesn't imply
  // this is the record's only seal when it isn't.
  const reopenEvents = sealHistory.filter((e) => e.eventType === 'reopened')
  if (reopenEvents.length > 0) {
    doc.moveDown(1)
    doc.fontSize(10).fillColor(ALERT).text(`This assessment has been reopened ${reopenEvents.length} time${reopenEvents.length === 1 ? '' : 's'} since it was first sealed:`)
    reopenEvents.forEach((e) => {
      doc.moveDown(0.3)
      doc.fontSize(9).fillColor(INK).text(
        `${new Date(e.createdAt).toLocaleString()} — reopened by ${e.userName || 'a team member'}: "${e.reason}"`,
        { width: 495 }
      )
      if (e.sealHash) {
        doc.fontSize(8).fillColor(MUTED).text(`Broke seal: ${e.sealHash} (sealed ${e.sealTimestampTime ? new Date(e.sealTimestampTime).toLocaleString() : '—'})`, { width: 495 })
      }
    })
  }

  // --- Hazard register + risk chart ---
  doc.addPage()
  doc.fontSize(18).fillColor(INK).text('Hazard Register')
  doc.moveDown(0.5)
  doc.fontSize(10).fillColor(MUTED).text(`${hazards.length} hazard${hazards.length === 1 ? '' : 's'} assessed`)
  doc.moveDown(1)

  const chartLeft = 50
  const chartWidth = 495
  const barHeight = 16
  const barGap = 8

  hazards.slice(0, 15).forEach((h) => {
    const y = doc.y
    doc.fontSize(9).fillColor(INK).text(h.title, chartLeft, y, { width: 220, height: barHeight })
    const barMaxWidth = chartWidth - 240
    const filled = Math.min(h.riskRating / 25, 1) * barMaxWidth
    doc.rect(chartLeft + 225, y, barMaxWidth, barHeight).fill('#F0F1F5')
    doc.rect(chartLeft + 225, y, filled, barHeight).fill(riskColor(h.riskRating))
    doc.fontSize(9).fillColor(INK).text(String(h.riskRating), chartLeft + 225 + barMaxWidth + 6, y + 3, { lineBreak: false })
    doc.x = chartLeft
    doc.y = y + barHeight + barGap
  })

  doc.x = chartLeft
  doc.moveDown(1)
  hazards.forEach((h) => {
    if (doc.y > 700) doc.addPage()
    doc.x = chartLeft
    doc.fontSize(11).fillColor(INK).text(h.title, chartLeft, doc.y, { width: 495 })
    doc.x = chartLeft
    doc.fontSize(9).fillColor(MUTED).text(`${h.category} · Risk score ${h.riskRating} · ${h.status}`, chartLeft, doc.y, { width: 495 })
    if (h.description) {
      doc.x = chartLeft
      doc.fontSize(9).fillColor(INK).text(h.description, chartLeft, doc.y, { width: 495 })
    }
    doc.moveDown(0.75)
  })

  // --- Action plan ---
  doc.addPage()
  doc.fontSize(18).fillColor(INK).text('Action Plan')
  doc.moveDown(0.3)
  doc.fontSize(10).fillColor(MUTED).text('Sorted by urgency: overdue items first, then by due date.')
  doc.moveDown(1)

  sortedActions.forEach((a) => {
    if (doc.y > 720) doc.addPage()
    const overdue = a.dueDate && !['complete', 'closed'].includes(a.status) && new Date(a.dueDate) < today
    doc.fontSize(11).fillColor(overdue ? DESTRUCTIVE : INK).text(`${overdue ? '[OVERDUE] ' : ''}${a.title}`)
    doc.fontSize(9).fillColor(MUTED).text(
      `Owner: ${a.ownerName || '—'}    Due: ${a.dueDate || '—'}    Status: ${a.status.replace('_', ' ')}`
    )
    if (a.description) doc.fontSize(9).fillColor(INK).text(a.description, { width: 495 })
    doc.moveDown(0.6)
  })
  if (sortedActions.length === 0) doc.fontSize(10).fillColor(MUTED).text('No action items recorded.')

  // --- Consultation records ---
  doc.addPage()
  doc.fontSize(18).fillColor(INK).text('Consultation Records')
  doc.moveDown(1)
  consultations.forEach((c) => {
    if (doc.y > 720) doc.addPage()
    doc.fontSize(11).fillColor(INK).text(`${c.date}, ${c.method || 'Consultation'}`)
    doc.fontSize(9).fillColor(MUTED).text(`Attendees: ${c.attendees || '—'}`)
    if (c.summary) doc.fontSize(9).fillColor(INK).text(c.summary, { width: 495 })
    doc.moveDown(0.6)
  })
  if (consultations.length === 0) doc.fontSize(10).fillColor(MUTED).text('No consultation records logged.')

  // --- State-specific compliance section ---
  const assessmentState = caseRow.state || org.state || ''
  doc.addPage()
  doc.fontSize(18).fillColor(INK).text('Compliance Reference')
  doc.moveDown(0.3)
  doc.fontSize(10).fillColor(MUTED).text(
    assessmentState
      ? `Legislation and codes of practice applicable in ${assessmentState}, referenced against each assessed hazard.`
      : 'No state/territory set for this assessment, showing general reference only.'
  )
  doc.moveDown(1)

  const libRows = db.prepare('SELECT * FROM hazard_library').all() as any[]
  const byId = new Map(libRows.map((r) => [r.id, r]))
  hazards.forEach((h) => {
    if (!h.hazardLibraryId) return
    const lib = byId.get(h.hazardLibraryId)
    if (!lib) return
    const legislation = JSON.parse(lib.legislation)
    const citation = assessmentState ? legislation[assessmentState] : null
    if (doc.y > 720) doc.addPage()
    doc.fontSize(10).fillColor(INK).text(h.title)
    doc.fontSize(9).fillColor(MUTED).text(citation || 'No state/territory set for this assessment.', { width: 495 })
    doc.moveDown(0.5)
  })

  doc.end()
})
