// Rebuilds demo assessments for one organisation (default org 1).
// Usage on the droplet:  cd /opt/humanora/server && node scripts/seed-demo.mjs [orgId]
// - Takes a backup copy of the DB first (<db>.pre-demo)
// - Deletes the org's existing assessments (cases) and everything under them
// - Leaves the organisation record, users and billing untouched
// - Does NOT create sealed assessments (a seal must be a real hash + timestamp)
import { DatabaseSync } from 'node:sqlite'
import { copyFileSync } from 'node:fs'

const DB_PATH = process.env.DATABASE_PATH || '/var/lib/humanora/humanora.db'
const ORG_ID = Number(process.argv[2] || 1)

copyFileSync(DB_PATH, DB_PATH + '.pre-demo')
const db = new DatabaseSync(DB_PATH)

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map((r) => r.name)
const cols = (t) => db.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name)
const SKIP = ['hazards', 'cases', 'hazard_library', 'organizations', 'users', 'invites']

function insert(table, row) {
  const have = cols(table)
  const keys = Object.keys(row).filter((k) => have.includes(k) && row[k] !== undefined)
  const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`
  return Number(db.prepare(sql).run(...keys.map((k) => row[k])).lastInsertRowid)
}

const iso = (n) => new Date(Date.now() + n * 864e5).toISOString()
const day = (n) => iso(n).slice(0, 10)

const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(ORG_ID)
if (!org) throw new Error('No organisation with id ' + ORG_ID)
const users = db.prepare('SELECT id, name FROM users WHERE orgId = ? ORDER BY id').all(ORG_ID)
const owner = (i) => (users.length ? users[i % users.length] : null)
const state = org.state || 'NSW'

const lib = db.prepare('SELECT id, name, category, description FROM hazard_library ORDER BY id').all()
if (!lib.length) throw new Error('hazard_library is empty')
let fallback = 0
const pick = (kw) => lib.find((h) => new RegExp(kw, 'i').test(h.name + ' ' + h.category)) || lib[fallback++ % lib.length]

db.exec('BEGIN')
try {
  // 1. Wipe existing assessments for this org
  const caseIds = db.prepare('SELECT id FROM cases WHERE orgId = ?').all(ORG_ID).map((r) => r.id)
  if (caseIds.length) {
    const inC = caseIds.join(',')
    const hazardIds = db.prepare(`SELECT id FROM hazards WHERE caseId IN (${inC})`).all().map((r) => r.id)
    const inH = hazardIds.length ? hazardIds.join(',') : 'NULL'
    for (const t of tables) {
      if (SKIP.includes(t)) continue
      if (cols(t).includes('hazardId')) db.exec(`DELETE FROM ${t} WHERE hazardId IN (${inH})`)
    }
    for (const t of tables) {
      if (SKIP.includes(t)) continue
      if (cols(t).includes('caseId')) db.exec(`DELETE FROM ${t} WHERE caseId IN (${inC})`)
    }
    db.exec(`DELETE FROM hazards WHERE caseId IN (${inC})`)
    db.exec(`DELETE FROM cases WHERE id IN (${inC})`)
  }

  // 2. Demo assessments
  const demo = [
    {
      name: 'Tower Site, Sydney: 2026 Assessment',
      createdAt: iso(-9),
      hazards: [
        { kw: 'demand|workload', L: 4, C: 4 },
        { kw: 'control|autonomy', L: 3, C: 3 },
      ],
      actions: [],
      consultations: [],
    },
    {
      name: 'Civil Works, Parramatta: 2026 Assessment',
      createdAt: iso(-28),
      hazards: [
        { kw: 'demand|workload', L: 5, C: 4 },
        { kw: 'support', L: 4, C: 3 },
        { kw: 'change', L: 3, C: 4 },
        { kw: 'violence|aggress|bully|harass', L: 2, C: 5 },
      ],
      actions: [
        { h: 0, title: 'Review rosters and overtime caps for site crews', due: day(14), done: false },
        { h: 1, title: 'Supervisor check-in program (fortnightly one-on-ones)', due: day(-6), done: false },
        { h: 2, title: 'Consult crews before the next program change', due: day(30), done: false },
        { h: 3, title: 'Issue and brief the aggression and harassment procedure', due: day(-20), done: true },
      ],
      consultations: [
        { ago: -21, method: 'Toolbox talk', attendees: 'Site crew (14), site supervisor, HSE rep', summary: 'Workers raised long hours during pours and unclear escalation paths. Agreed to review rosters.' },
      ],
    },
    {
      name: 'Head Office and Estimating: 2026 Assessment',
      createdAt: iso(-55),
      hazards: [
        { kw: 'demand|workload', L: 4, C: 4, rL: 3, rC: 3 },
        { kw: 'role', L: 3, C: 3, rL: 2, rC: 3 },
        { kw: 'recognition|reward', L: 3, C: 3 },
        { kw: 'remote|isolat', L: 2, C: 3, rL: 2, rC: 2 },
        { kw: 'justice|fair', L: 2, C: 4 },
      ],
      actions: [
        { h: 0, title: 'Introduce tender-deadline workload planning', due: day(-30), done: true },
        { h: 1, title: 'Update position descriptions for estimators', due: day(-15), done: true },
        { h: 2, title: 'Add quarterly recognition to team meetings', due: day(21), done: false },
        { h: 3, title: 'Weekly team catch-up for remote staff', due: day(-40), done: true },
        { h: 4, title: 'Publish grievance and fair-process guide', due: day(45), done: false },
        { h: 0, title: 'Review staffing for peak tender periods', due: day(-3), done: false },
      ],
      consultations: [
        { ago: -48, method: 'Staff survey', attendees: 'All head office staff (22 responses)', summary: 'Workload during tenders and role clarity were the top concerns.' },
        { ago: -40, method: 'Workshop', attendees: 'Estimating team, HR, GM', summary: 'Agreed priority actions and owners. Remote-work contact rhythm discussed.' },
      ],
    },
  ]

  let nCases = 0, nHaz = 0, nAct = 0, nCons = 0
  for (const c of demo) {
    const caseId = insert('cases', { orgId: ORG_ID, name: c.name, state, status: 'open', createdAt: c.createdAt })
    nCases++
    const hazardIds = []
    for (const h of c.hazards) {
      const lh = pick(h.kw)
      const hasRes = h.rL != null
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
          residualLikelihood: hasRes ? h.rL : null,
          residualConsequence: hasRes ? h.rC : null,
          residualRiskRating: hasRes ? h.rL * h.rC : null,
          residualRatedAt: hasRes ? iso(-10) : null,
          status: 'open',
          createdAt: c.createdAt,
        }),
      )
      nHaz++
    }
    c.actions.forEach((a, i) => {
      const o = owner(i)
      insert('action_items', {
        caseId,
        hazardId: hazardIds[a.h],
        title: a.title,
        description: '',
        ownerName: o ? o.name : '',
        ownerId: o ? o.id : null,
        dueDate: a.due,
        status: a.done ? 'completed' : 'pending',
        createdAt: c.createdAt,
        completedAt: a.done ? iso(-12) : null,
      })
      nAct++
    })
    for (const k of c.consultations) {
      insert('consultations', { caseId, date: day(k.ago), method: k.method, attendees: k.attendees, summary: k.summary, createdAt: iso(k.ago) })
      nCons++
    }
  }
  db.exec('COMMIT')
  console.log(`Org ${ORG_ID}: replaced ${caseIds.length} old assessments with ${nCases} demo assessments, ${nHaz} hazards, ${nAct} actions, ${nCons} consultations.`)
  console.log('Backup saved to ' + DB_PATH + '.pre-demo')
} catch (e) {
  db.exec('ROLLBACK')
  console.error('Failed, nothing changed:', e.message)
  process.exit(1)
}
