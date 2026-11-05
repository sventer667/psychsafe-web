import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { requireTrialActive } from '../trialGate.js'

export const onboardingRouter = Router()
onboardingRouter.use(requireAuth)

// The sample assessment is identified by this name prefix. It is excluded from
// the checklist counts so that looking at the sample doesn't tick the user's
// own steps for them.
export const SAMPLE_PREFIX = 'Sample:'

const count = (sql: string, ...args: (string | number)[]): number => {
  try {
    return (db.prepare(sql).get(...args) as { n: number }).n
  } catch {
    return 0
  }
}

// What the user has actually done, so the dashboard checklist ticks itself.
onboardingRouter.get('/', (req: AuthedRequest, res) => {
  const orgId = req.auth!.orgId
  const like = `${SAMPLE_PREFIX}%`

  const org = db.prepare('SELECT state FROM organizations WHERE id = ?').get(orgId) as { state: string | null } | undefined

  const cases = count('SELECT COUNT(*) AS n FROM cases WHERE orgId = ? AND name NOT LIKE ?', orgId, like)
  const hazards = count(
    'SELECT COUNT(*) AS n FROM hazards h JOIN cases c ON c.id = h.caseId WHERE c.orgId = ? AND c.name NOT LIKE ?',
    orgId,
    like
  )
  const actions = count(
    'SELECT COUNT(*) AS n FROM action_items a JOIN cases c ON c.id = a.caseId WHERE c.orgId = ? AND c.name NOT LIKE ?',
    orgId,
    like
  )
  const consultations = count(
    'SELECT COUNT(*) AS n FROM consultations k JOIN cases c ON c.id = k.caseId WHERE c.orgId = ? AND c.name NOT LIKE ?',
    orgId,
    like
  )
  const users = count('SELECT COUNT(*) AS n FROM users WHERE orgId = ?', orgId)
  const invites = count('SELECT COUNT(*) AS n FROM invites WHERE orgId = ?', orgId)
  const sample = db
    .prepare('SELECT id FROM cases WHERE orgId = ? AND name LIKE ? ORDER BY id DESC LIMIT 1')
    .get(orgId, like) as { id: number } | undefined

  res.json({
    profile: !!org?.state,
    assessment: cases > 0,
    hazard: hazards > 0,
    action: actions > 0,
    consultation: consultations > 0,
    teammate: users > 1 || invites > 0,
    sampleCaseId: sample?.id ?? null,
  })
})

// --- Sample assessment ---

const cols = (table: string): string[] =>
  (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name)

// Inserts only the columns that exist, so this keeps working if the schema grows.
function insert(table: string, row: Record<string, unknown>): number {
  const have = cols(table)
  const keys = Object.keys(row).filter((k) => have.includes(k) && row[k] !== undefined)
  const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`
  return Number(db.prepare(sql).run(...(keys.map((k) => row[k]) as never[])).lastInsertRowid)
}

const day = (offset: number) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10)
const iso = (offset: number) => new Date(Date.now() + offset * 864e5).toISOString()

onboardingRouter.post('/sample', requireTrialActive, (req: AuthedRequest, res) => {
  const orgId = req.auth!.orgId
  const userId = req.auth!.userId

  const existing = db
    .prepare('SELECT id FROM cases WHERE orgId = ? AND name LIKE ? ORDER BY id DESC LIMIT 1')
    .get(orgId, `${SAMPLE_PREFIX}%`) as { id: number } | undefined
  if (existing) return res.json({ caseId: existing.id, created: false })

  const lib = db
    .prepare('SELECT id, name, category, description FROM hazard_library ORDER BY id')
    .all() as { id: number; name: string; category: string; description: string }[]
  if (lib.length === 0) return res.status(500).json({ error: 'The hazard library is empty' })

  const org = db.prepare('SELECT state FROM organizations WHERE id = ?').get(orgId) as { state: string | null } | undefined
  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as { name: string } | undefined

  let fallback = 0
  const pick = (kw: string) =>
    lib.find((h) => new RegExp(kw, 'i').test(`${h.name} ${h.category}`)) || lib[fallback++ % lib.length]

  const hazardSpecs = [
    { kw: 'demand|workload', L: 4, C: 4, rL: 3, rC: 3 },
    { kw: 'support', L: 3, C: 4 },
    { kw: 'change', L: 3, C: 3 },
    { kw: 'violence|aggress|bully|harass', L: 2, C: 5 },
  ]
  const actionSpecs = [
    { h: 0, title: 'Review rosters and overtime caps', due: day(14), done: true },
    { h: 1, title: 'Start fortnightly supervisor check-ins', due: day(-5), done: false },
    { h: 2, title: 'Consult the team before the next change', due: day(30), done: false },
  ]

  try {
    db.exec('BEGIN')
    const caseId = insert('cases', {
      orgId,
      name: `${SAMPLE_PREFIX} Example workplace assessment (delete when you're done)`,
      state: org?.state || '',
      status: 'open',
      scope: 'Example data to show how an assessment works. Safe to delete at any time.',
      createdAt: iso(-14),
    })

    const hazardIds: number[] = []
    for (const h of hazardSpecs) {
      const lh = pick(h.kw)
      const hasRes = (h as { rL?: number }).rL != null
      hazardIds.push(
        insert('hazards', {
          caseId,
          hazardLibraryId: lh.id,
          title: lh.name,
          category: lh.category,
          description: lh.description,
          likelihood: h.L,
          consequence: h.C,
          riskRating: h.L * h.C,
          residualLikelihood: hasRes ? (h as { rL: number }).rL : null,
          residualConsequence: hasRes ? (h as { rC: number }).rC : null,
          residualRiskRating: hasRes ? (h as { rL: number; rC: number }).rL * (h as { rC: number }).rC : null,
          residualRatedAt: hasRes ? iso(-3) : null,
          status: 'open',
          createdAt: iso(-14),
        })
      )
    }

    for (const a of actionSpecs) {
      insert('action_items', {
        caseId,
        hazardId: hazardIds[a.h],
        title: a.title,
        description: '',
        ownerName: user?.name || '',
        ownerId: userId,
        dueDate: a.due,
        status: a.done ? 'complete' : 'pending',
        createdAt: iso(-14),
        completedAt: a.done ? iso(-4) : null,
      })
    }

    insert('consultations', {
      caseId,
      date: day(-10),
      method: 'Toolbox talk',
      attendees: 'Site crew, supervisor, safety rep',
      summary: 'Workers raised long hours and unclear escalation paths. Agreed to review rosters.',
      createdAt: iso(-10),
    })

    db.exec('COMMIT')
    res.json({ caseId, created: true })
  } catch (err) {
    db.exec('ROLLBACK')
    console.error('Sample assessment failed', err)
    res.status(500).json({ error: 'Could not create the sample assessment' })
  }
})
