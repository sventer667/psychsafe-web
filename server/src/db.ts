import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'node:fs'
import { seedHazardLibrary } from './seedHazardLibrary.js'

// Uses Node's built-in node:sqlite (stable-ish since Node 22.5, no native
// build step required) rather than better-sqlite3, which needs a compiled
// binary that isn't available in every deploy environment.
const DB_PATH = process.env.DATABASE_PATH || './connexus.db'
const isNew = !existsSync(DB_PATH)

export const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA foreign_keys = ON')

db.exec(`
-- An Organization is the employer using Connexus to manage its own psychosocial
-- risks directly (self-service model), not a third-party consultant's client list.
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  industry TEXT DEFAULT '',
  state TEXT DEFAULT '',
  businessUnit TEXT DEFAULT '',
  planStatus TEXT NOT NULL DEFAULT 'trialing',
  planTier TEXT NOT NULL DEFAULT 'starter',
  trialEndsAt TEXT,
  stripeCustomerId TEXT,
  stripeSubscriptionId TEXT,
  consultantName TEXT DEFAULT '',
  consultantCredential TEXT DEFAULT '',
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- totpSecret/totpEnabled/totpBackupCodes back a TOTP-based second factor
-- (Google Authenticator, Authy, etc.). totpSecret is set as soon as a user
-- starts enrolling but totpEnabled only flips to 1 once they've proven they
-- can generate a valid code, so a half-finished enrollment never locks
-- anyone out. totpBackupCodes is a JSON array of bcrypt-hashed one-time
-- recovery codes, issued once when 2FA is enabled.
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orgId INTEGER NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  totpSecret TEXT,
  totpEnabled INTEGER NOT NULL DEFAULT 0,
  totpBackupCodes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Pending invitations to join an org. There's no transactional email wired up
-- yet, so an invite is redeemed via a one-time link (/invite/:token) that the
-- inviting user copies and shares themselves, rather than an emailed link.
CREATE TABLE IF NOT EXISTS invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orgId INTEGER NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  expiresAt TEXT NOT NULL,
  acceptedAt TEXT
);

-- Reference library: Safe Work Australia-aligned psychosocial hazard categories,
-- each mapped to legislation/codes of practice per state/territory and a six-level
-- hierarchy of controls. Seeded once, shared read-only across all orgs.
CREATE TABLE IF NOT EXISTS hazard_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  controls TEXT NOT NULL,
  legislation TEXT NOT NULL
);

-- A Case is one psychosocial risk assessment engagement for the organization.
-- An organization can have multiple cases over time (e.g. annual reassessments,
-- or separate assessments per business unit/site). Each case carries its own
-- state/territory (defaulted from the org's at creation, editable after), so
-- an org with sites in more than one state can run one assessment per site
-- and get the right legislation citations for each, instead of being limited
-- to a single org-wide state.
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orgId INTEGER NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  state TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  closedAt TEXT,
  sealHash TEXT,
  sealAlgorithm TEXT,
  sealTimestampToken TEXT,
  sealTimestampAuthority TEXT,
  sealTimestampTime TEXT
);

-- residualLikelihood/residualConsequence/residualRiskRating capture a
-- deliberate re-rating of the hazard after controls have been put in place,
-- separate from the inherent likelihood/consequence/riskRating captured when
-- the hazard was first logged. Left NULL until someone re-rates it, so the
-- dashboard gauges can honestly fall back to the inherent score rather than
-- assume an unproven risk reduction.
CREATE TABLE IF NOT EXISTS hazards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caseId INTEGER NOT NULL REFERENCES cases(id),
  hazardLibraryId INTEGER REFERENCES hazard_library(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  likelihood INTEGER NOT NULL,
  consequence INTEGER NOT NULL,
  riskRating INTEGER NOT NULL,
  residualLikelihood INTEGER,
  residualConsequence INTEGER,
  residualRiskRating INTEGER,
  residualRatedAt TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS action_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caseId INTEGER NOT NULL REFERENCES cases(id),
  hazardId INTEGER REFERENCES hazards(id),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  ownerName TEXT DEFAULT '',
  dueDate TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  completedAt TEXT
);

CREATE TABLE IF NOT EXISTS consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caseId INTEGER NOT NULL REFERENCES cases(id),
  date TEXT NOT NULL,
  method TEXT DEFAULT '',
  attendees TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Permanent audit trail of every seal and reopen on a case, so "immutable
-- after closure" is backed by a record rather than just the current row on
-- cases (which only ever holds the latest seal, and gets wiped on reopen).
-- A 'reopened' row carries the reason the user gave plus a copy of the seal
-- it just broke, so the fact a case was ever unsealed, by whom, why, and
-- which seal was invalidated is never lost even after it's resealed.
CREATE TABLE IF NOT EXISTS case_seal_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caseId INTEGER NOT NULL REFERENCES cases(id),
  eventType TEXT NOT NULL, -- 'sealed' | 'reopened'
  userId INTEGER REFERENCES users(id),
  userName TEXT NOT NULL DEFAULT '',
  reason TEXT DEFAULT '',
  sealHash TEXT,
  sealAlgorithm TEXT,
  sealTimestampToken TEXT,
  sealTimestampAuthority TEXT,
  sealTimestampTime TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
`)

// Defensive migration: a database created before the trial-lockout feature
// existed has an `organizations` table without this column (CREATE TABLE IF
// NOT EXISTS above is a no-op against an existing table). Adding it here
// means the feature works correctly even without a fresh DB.
try {
  db.exec('ALTER TABLE organizations ADD COLUMN trialEndsAt TEXT')
} catch {
  // Column already exists, either a fresh DB (created with it above) or a
  // database this migration already ran against.
}

// Backfill: any trialing org from before this feature existed gets a trial
// window computed from its signup date, rather than being silently locked
// out immediately or granted an indefinite free trial.
db.exec(`
  UPDATE organizations
  SET trialEndsAt = datetime(createdAt, '+7 days')
  WHERE trialEndsAt IS NULL AND planStatus = 'trialing'
`)

// Defensive migration: a database created before TOTP two-factor existed has
// a `users` table without these columns.
for (const stmt of [
  'ALTER TABLE users ADD COLUMN totpSecret TEXT',
  "ALTER TABLE users ADD COLUMN totpEnabled INTEGER NOT NULL DEFAULT 0",
  'ALTER TABLE users ADD COLUMN totpBackupCodes TEXT',
]) {
  try {
    db.exec(stmt)
  } catch {
    // Column already exists, either a fresh DB (created with it above) or a
    // database this migration already ran against.
  }
}

// Defensive migration: a database created before per-assessment state existed
// has a `cases` table without this column.
try {
  db.exec("ALTER TABLE cases ADD COLUMN state TEXT DEFAULT ''")
} catch {
  // Column already exists, either a fresh DB (created with it above) or a
  // database this migration already ran against.
}

// Backfill: any case from before this feature existed gets its org's state
// as a starting point (editable per-case from here), rather than showing no
// legislation citation at all until someone happens to edit it.
db.exec(`
  UPDATE cases
  SET state = (SELECT state FROM organizations WHERE organizations.id = cases.orgId)
  WHERE (state IS NULL OR state = '')
    AND EXISTS (SELECT 1 FROM organizations WHERE organizations.id = cases.orgId AND organizations.state != '')
`)

// Backfill: rewrite two hazard_library entries seeded before a copy pass
// removed em dashes from user-facing text, and the matching legislation
// citation strings (stored per-row, so every row needs the same replace).
db.exec(`UPDATE hazard_library SET name = 'Poor supervisor support' WHERE name = 'Poor support — supervisor'`)
db.exec(`UPDATE hazard_library SET name = 'Poor peer support' WHERE name = 'Poor support — peer'`)
db.exec(`
  UPDATE hazard_library
  SET legislation = REPLACE(
    REPLACE(legislation,
      'Managing psychosocial hazards at work — Code of Practice 2021 (NSW)',
      'Managing psychosocial hazards at work, Code of Practice 2021 (NSW)'),
    'Managing the risk of psychosocial hazards at work — Code of Practice 2022 (Qld)',
    'Managing the risk of psychosocial hazards at work, Code of Practice 2022 (Qld)')
`)

// Backfill: Victoria's psychosocial hazard citation was seeded referencing
// only the general OHS Act, before the Occupational Health and Safety
// (Psychological Health) Regulations 2025 (Vic) took effect on 1 December
// 2025. Rewrites the already-seeded rows in place rather than relying on a
// re-seed, since hazard_library is only ever seeded once per database.
db.exec(`
  UPDATE hazard_library
  SET legislation = REPLACE(
    legislation,
    'Occupational Health and Safety Act 2004 (Vic); WorkSafe Victoria psychological health guidance',
    'Occupational Health and Safety Act 2004 (Vic); Occupational Health and Safety (Psychological Health) Regulations 2025 (Vic), in effect from 1 December 2025'
  )
`)

// Defensive migration: a database created before residual (post-control) risk
// ratings existed has a `hazards` table without these columns.
for (const stmt of [
  'ALTER TABLE hazards ADD COLUMN residualLikelihood INTEGER',
  'ALTER TABLE hazards ADD COLUMN residualConsequence INTEGER',
  'ALTER TABLE hazards ADD COLUMN residualRiskRating INTEGER',
  'ALTER TABLE hazards ADD COLUMN residualRatedAt TEXT',
]) {
  try {
    db.exec(stmt)
  } catch {
    // Column already exists, either a fresh DB (created with it above) or a
    // database this migration already ran against.
  }
}

if (isNew) {
  console.log(`Created new SQLite database at ${DB_PATH}`)
  seedHazardLibrary(db)
} else {
  const row = db.prepare('SELECT COUNT(*) as n FROM hazard_library').get() as { n: number }
  if (row.n === 0) seedHazardLibrary(db)
}
