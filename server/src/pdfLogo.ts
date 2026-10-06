import fs from 'fs'
import path from 'path'
import type PDFDocument from 'pdfkit'

const LOGO_PATH = path.join(process.cwd(), 'assets', 'humanora-logo.png')
const LOGO_WIDTH = 150
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 149) / 800)

// Draws the Humanora logo at the top of the current PDF page and moves the
// text cursor below it. Silently skipped if the logo file is missing.
export function drawLogo(doc: InstanceType<typeof PDFDocument>): void {
  try {
    if (!fs.existsSync(LOGO_PATH)) return
    doc.image(LOGO_PATH, 50, 40, { width: LOGO_WIDTH })
    doc.x = 50
    doc.y = 40 + LOGO_HEIGHT + 24
  } catch (err) {
    console.error('PDF logo failed', err)
  }
}
