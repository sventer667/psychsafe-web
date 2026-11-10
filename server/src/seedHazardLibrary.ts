import type { DatabaseSync } from 'node:sqlite'

// Hierarchy of controls for psychosocial hazards, following the WHS Regulations
// and the codes of practice: eliminate; then minimise (substitution, isolation,
// engineering); then administrative controls. The final line in each list is
// supplementary support (e.g. counselling, coaching). It is not a tier of the
// hierarchy and does not replace the controls above it. PPE is not listed as a
// separate line (WA's code allows it for violence and aggression, e.g. duress
// alarms, which are filed here under engineering).
// Each hazard gets its own tailored set of controls rather than a shared
// template, so the guidance reflects how that specific hazard actually shows
// up at work. Grounded in Safe Work Australia's Model Code of Practice:
// Managing psychosocial hazards at work (July 2022), the February 2026 South
// Australian version (adds fatigue, job insecurity and intrusive surveillance
// as named hazards), and the WA codes. Hostile work environment, high emotional
// labour demands, poor organisational communication and poor procedural
// justice are not headings in any code; the codes use them as examples.
const HAZARD_CONTROLS: Record<string, string[]> = {
  'High job demands': [
    'Eliminate: redesign the role or process to remove tasks that create sustained excessive workload, time pressure, or unreasonable deadlines (e.g. cut non-essential reporting, automate repetitive tasks).',
    'Minimise, substitution: reallocate peak-period work across a wider team or timeframe rather than concentrating it on a few workers.',
    'Minimise, isolation: cap the number of consecutive high-demand shifts or projects any one worker can be rostered onto without a lower-demand break.',
    'Minimise, engineering / system controls: use workload-forecasting and staffing tools to match resourcing to demand before it becomes unmanageable.',
    'Administrative controls: set realistic deadlines and KPIs, review workloads at regular intervals, and require manager sign-off before adding tasks to an already full workload.',
    'Supplementary support (not a substitute for the controls above): provide time-management coaching and EAP access for workers experiencing demand-related strain.',
  ],
  'Low job control': [
    'Eliminate: redesign jobs to build in genuine autonomy over how, when, and in what order tasks are completed, rather than dictating every step.',
    'Minimise, substitution: replace rigid, top-down task allocation with team-based rostering or self-scheduling where operationally possible.',
    'Minimise, isolation: give workers control over the parts of the job that can be delegated (e.g. break timing, task sequencing) even where the overall process is fixed.',
    'Minimise, engineering / system controls: introduce rostering or workflow tools that let workers set preferences and see the reasoning behind decisions that affect them.',
    'Administrative controls: consult workers before finalising schedules or procedures, and provide a mechanism to request changes.',
    'Supplementary support (not a substitute for the controls above): train supervisors to identify and respond to workers reporting low autonomy, and offer coaching on raising concerns constructively.',
  ],
  'Poor supervisor support': [
    'Eliminate: restructure reporting lines so no worker is left without an accessible, responsive supervisor.',
    'Minimise, substitution: replace absent or inconsistent supervision with a buddy system or acting-supervisor arrangement during gaps.',
    'Minimise, isolation: adjust team structure to separate a worker from a specific unsupportive supervisor while the underlying issue is addressed.',
    "Minimise, engineering / system controls: introduce structured check-in tools (e.g. scheduled 1:1 templates, escalation pathways) that don't rely solely on a supervisor's individual initiative.",
    'Administrative controls: set minimum standards for supervisor check-ins and feedback, and include them in supervisor performance reviews.',
    'Supplementary support (not a substitute for the controls above): provide supervisor training in supportive leadership and psychosocial awareness, and EAP access for affected workers.',
  ],
  'Poor peer support': [
    'Eliminate: redesign work so no worker is required to perform high-risk or high-demand tasks in isolation from colleagues who could back them up.',
    'Minimise, substitution: replace ad hoc, informal peer backup with a rostered buddy or mentoring system.',
    'Minimise, isolation: rotate isolated workers back into team-based settings where peer contact is possible.',
    "Minimise, engineering / system controls: use team communication tools and shared channels so peer support doesn't depend on physical proximity.",
    'Administrative controls: build regular team meetings and peer-support check-ins into the schedule.',
    'Supplementary support (not a substitute for the controls above): offer team-building activities and access to peer-support or mentoring programs.',
  ],
  'Lack of role clarity': [
    'Eliminate: redesign roles so responsibilities, authority, and reporting lines are unambiguous from the outset, removing overlapping or undefined duties.',
    'Minimise, substitution: replace informal or verbal role descriptions with clear, written position descriptions reviewed at onboarding and after any restructure.',
    "Minimise, isolation: where overlap between roles can't be immediately fixed, clarify decision rights for the specific tasks causing confusion.",
    'Minimise, engineering / system controls: maintain org charts, RACI matrices, or workflow documentation that is kept current and accessible.',
    'Administrative controls: require managers to confirm role expectations at induction and after any team or structural change.',
    'Supplementary support (not a substitute for the controls above): offer 1:1 clarification sessions and coaching for workers uncertain about their responsibilities.',
  ],
  'Poor organisational change management': [
    "Eliminate: where change isn't essential, avoid disruptive restructuring; where it is, plan it with a documented change-management process from the start.",
    'Minimise, substitution: replace abrupt, top-down change announcements with staged rollouts that include consultation before decisions are finalised.',
    'Minimise, isolation: limit the number of concurrent major changes a team is exposed to at once.',
    "Minimise, engineering / system controls: use change-management frameworks and communication plans that set out what's changing, when, and why.",
    'Administrative controls: require consultation with affected workers and their representatives before change is implemented, per WHS consultation obligations.',
    'Supplementary support (not a substitute for the controls above): provide transition support, EAP access, and clear points of contact for questions during change.',
  ],
  'Low recognition and reward': [
    'Eliminate: redesign performance and remuneration systems so effort and achievement are structurally recognised, not left to chance.',
    'Minimise, substitution: replace purely financial reward mechanisms, where inadequate or unavailable, with meaningful non-financial recognition such as development opportunities or public acknowledgement.',
    'Minimise, isolation: address recognition gaps for specific under-recognised roles or teams identified through survey data.',
    'Minimise, engineering / system controls: introduce formal recognition platforms or structured review processes that prompt timely acknowledgement.',
    'Administrative controls: set expectations and schedules for regular, fair performance feedback and recognition.',
    'Supplementary support (not a substitute for the controls above): train managers in giving effective feedback and recognition, and provide coaching for workers feeling undervalued.',
  ],
  'Poor procedural justice': [
    'Eliminate: redesign decision-making processes so everyone affected by a decision is heard before it is made, removing unilateral or opaque processes.',
    'Minimise, substitution: replace informal, inconsistent decision-making with documented, consistent procedures applied the same way to everyone.',
    'Minimise, isolation: review and correct specific decisions made without proper process while the broader procedure is fixed.',
    'Minimise, engineering / system controls: use structured decision templates and approval workflows that build in consultation steps.',
    'Administrative controls: publish and train staff on the procedures used for decisions affecting them (e.g. rostering, discipline, promotion).',
    'Supplementary support (not a substitute for the controls above): provide a clear appeals or grievance pathway and support for workers who feel a decision was unfair.',
  ],
  'Poor organisational justice': [
    'Eliminate: redesign systems that allocate workload, opportunity, or discipline so outcomes are equitable and rule-based rather than discretionary.',
    'Minimise, substitution: replace inconsistent, manager-dependent decisions with standardised criteria applied across the organisation.',
    'Minimise, isolation: correct specific instances of unequal treatment identified through review while systemic change is implemented.',
    'Minimise, engineering / system controls: use data and audit trails to monitor how workload, opportunities, and discipline are distributed across the workforce.',
    'Administrative controls: set and communicate clear, consistent criteria for how outcomes are decided.',
    'Supplementary support (not a substitute for the controls above): provide a confidential channel for workers to raise perceived unfairness and have it reviewed.',
  ],
  'Poor workplace relationships': [
    'Eliminate: redesign team structures or reporting lines where a specific relationship breakdown is the root cause and cannot be resolved.',
    'Minimise, substitution: replace unmanaged interpersonal friction with structured conflict-resolution processes as the default response.',
    'Minimise, isolation: temporarily separate the parties involved in an unresolved conflict while mediation takes place.',
    'Minimise, engineering / system controls: introduce communication norms and team charters that set expectations for respectful interaction.',
    'Administrative controls: provide accessible, trained mediators or HR support for relationship breakdowns.',
    'Supplementary support (not a substitute for the controls above): offer conflict-coaching or counselling to individuals affected by poor relationships at work.',
  ],
  'Remote or isolated work': [
    'Eliminate: redesign work so tasks requiring true isolation, such as solo remote sites, are reassigned or paired wherever practicable.',
    'Minimise, substitution: replace solo remote assignments with paired or team-based staffing for higher-risk locations or tasks.',
    "Minimise, isolation: where the isolation itself can't be removed, limit the duration of any single period of isolated work.",
    'Minimise, engineering / system controls: provide reliable communication technology such as check-in apps, duress alarms, or satellite communication for isolated workers.',
    'Administrative controls: set mandatory check-in schedules and emergency response procedures for remote or isolated workers.',
    'Supplementary support (not a substitute for the controls above): provide mental health check-ins and EAP access tailored to the challenges of isolated work.',
  ],
  'Poor physical environment': [
    'Eliminate: redesign or relocate the workspace to remove the source of noise, poor air quality, extreme temperature, or overcrowding.',
    'Minimise, substitution: replace or upgrade equipment, layout, or materials contributing to poor conditions with better alternatives.',
    "Minimise, isolation: separate workers from the specific source of environmental strain where it can't be removed, e.g. sound barriers or dedicated quiet zones.",
    'Minimise, engineering / system controls: install ventilation, acoustic treatment, climate control, or layout changes to reduce exposure.',
    'Administrative controls: set maintenance schedules and workplace standards for temperature, noise, and space allocation.',
    'Supplementary support (not a substitute for the controls above): provide access to quiet or low-stimulation break spaces and rest breaks during periods of environmental strain.',
  ],
  'Violence and aggression': [
    'Eliminate: redesign the service, layout, or task so workers are not exposed to situations with a known risk of violence, e.g. remove cash handling or restrict high-risk after-hours work.',
    'Minimise, substitution: replace face-to-face handling of high-risk interactions with remote, screened, or accompanied alternatives.',
    'Minimise, isolation: use physical barriers, secure work areas, or restricted access to separate workers from potentially violent individuals.',
    'Minimise, engineering / system controls: install duress alarms, CCTV, and secure entry/exit points in areas with violence risk.',
    'Administrative controls: implement and train staff in de-escalation procedures, incident reporting, and post-incident response plans.',
    'Supplementary support (not a substitute for the controls above): provide trauma-informed counselling and EAP support immediately after any violent or threatening incident.',
  ],
  'Workplace bullying': [
    'Eliminate: redesign reporting lines or team structures where a specific pattern of bullying has been substantiated and cannot otherwise be stopped.',
    'Minimise, substitution: replace informal, unmonitored complaint handling with a formal, confidential bullying reporting and investigation process.',
    'Minimise, isolation: separate the parties involved, e.g. reassignment or altered reporting lines, while an investigation is underway.',
    'Minimise, engineering / system controls: use anonymous reporting tools and regular culture surveys to surface bullying before it escalates.',
    'Administrative controls: maintain and enforce an anti-bullying policy with clear consequences, and train managers to recognise early warning signs.',
    'Supplementary support (not a substitute for the controls above): provide counselling and support for workers who have experienced bullying, and coaching for managers on early intervention.',
  ],
  'Harassment including sexual harassment': [
    'Eliminate: redesign work arrangements such as rostering, travel, or accommodation that create unsupervised or high-risk situations enabling harassment.',
    'Minimise, substitution: replace informal complaint-handling with a confidential, independent reporting and investigation channel.',
    'Minimise, isolation: remove the alleged harasser from contact with the affected worker during investigation, not the other way around.',
    "Minimise, engineering / system controls: use anonymous reporting platforms and exit-interview data to detect harassment that isn't otherwise reported.",
    'Administrative controls: maintain a clear anti-harassment policy, mandatory training, and defined investigation timelines consistent with the positive duty under the Sex Discrimination Act.',
    'Supplementary support (not a substitute for the controls above): provide independent counselling support and a support person option for anyone involved in a complaint.',
  ],
  'Conflict or poor interpersonal relationships': [
    'Eliminate: redesign team composition or workflows where an unresolved, entrenched conflict is structurally embedded in how work is done.',
    'Minimise, substitution: replace avoidance or escalation-by-default with a structured, early conflict-resolution process.',
    'Minimise, isolation: temporarily adjust task allocation to reduce direct interaction between conflicting parties while resolution is pursued.',
    'Minimise, engineering / system controls: introduce clear communication channels and escalation pathways so conflict is raised before it entrenches.',
    'Administrative controls: train managers in early conflict identification and resolution, and set expectations for timely intervention.',
    'Supplementary support (not a substitute for the controls above): offer mediation and individual coaching to those involved.',
  ],
  'Exposure to traumatic events or content': [
    'Eliminate: redesign workflows so exposure to traumatic material is limited to what is strictly necessary for the role, e.g. de-identify content or rotate reviewers.',
    'Minimise, substitution: replace direct human review of the most severe material with technology-assisted screening or triage where feasible.',
    "Minimise, isolation: limit the duration and frequency of any individual worker's direct exposure to traumatic content or incidents.",
    "Minimise, engineering / system controls: use content-blurring, warning systems, or exposure caps built into the tools workers use.",
    'Administrative controls: implement mandatory post-exposure debriefs and rotation policies for high-trauma-exposure roles.',
    'Supplementary support (not a substitute for the controls above): provide trauma-informed clinical supervision, specialist counselling, and proactive psychological check-ins.',
  ],
  'Fatigue': [
    'Eliminate: redesign rosters and shift patterns to remove excessive hours or insufficient recovery time between shifts.',
    'Minimise, substitution: replace extended or back-to-back shift patterns with fatigue-managed rostering models.',
    'Minimise, isolation: limit the number of consecutive night shifts or extended shifts any worker can be rostered.',
    'Minimise, engineering / system controls: use fatigue-risk scoring software in rostering systems to flag high-risk schedules before they are assigned.',
    'Administrative controls: enforce mandatory minimum rest breaks between shifts and a fatigue-reporting procedure.',
    'Supplementary support (not a substitute for the controls above): provide fatigue-awareness training and access to fitness-for-duty and sleep-health support.',
  ],
  'Job insecurity': [
    'Eliminate: redesign employment arrangements to offer ongoing roles where the work itself is ongoing, rather than repeated short-term contracts.',
    'Minimise, substitution: replace ambiguous or last-minute contract renewal practices with defined notice periods and renewal timelines.',
    "Minimise, isolation: where insecurity can't be removed for a role type, limit how many consecutive insecure contract cycles an individual experiences.",
    'Minimise, engineering / system controls: use workforce-planning systems that flag upcoming contract decisions early enough to give genuine notice.',
    'Administrative controls: communicate employment status and any restructuring plans as early and transparently as possible.',
    'Supplementary support (not a substitute for the controls above): provide career transition support and EAP access for workers facing uncertain employment.',
  ],
  'Hostile work environment': [
    'Eliminate: redesign team culture interventions to remove entrenched norms of intimidation or exclusion, including leadership change where needed.',
    'Minimise, substitution: replace tolerance of hostile behaviour with a zero-tolerance, actively enforced code of conduct.',
    'Minimise, isolation: separate individuals identified as the source of hostility from the broader team while behaviour is addressed.',
    'Minimise, engineering / system controls: use culture surveys and anonymous feedback tools to detect hostility before it becomes entrenched.',
    'Administrative controls: set and enforce behavioural standards, with visible consequences for breaches.',
    'Supplementary support (not a substitute for the controls above): offer counselling and a safe reporting channel for workers affected by a hostile environment.',
  ],
  'High emotional labour demands': [
    "Eliminate: redesign the role so it doesn't require sustained suppression or management of emotion beyond what's inherent to the task.",
    'Minimise, substitution: replace continuous front-facing emotional-labour tasks with rotation into lower-emotional-demand duties.',
    'Minimise, isolation: cap the length of any single shift or session spent on high-emotional-labour tasks, e.g. frontline complaints or crisis calls.',
    'Minimise, engineering / system controls: use scripting, triage systems, or technology to absorb the most emotionally demanding parts of an interaction.',
    'Administrative controls: build in structured breaks and debriefs after emotionally demanding interactions.',
    'Supplementary support (not a substitute for the controls above): provide specialist training in emotional regulation and access to clinical supervision or counselling.',
  ],
  'Poor organisational communication': [
    "Eliminate: redesign information flows so decisions affecting workers' roles or safety are never withheld or delayed by default.",
    'Minimise, substitution: replace ad hoc or rumour-driven communication with scheduled, structured updates from a single source of truth.',
    'Minimise, isolation: identify and fix specific communication breakdowns, e.g. a team consistently left out of updates, while broader systems are improved.',
    'Minimise, engineering / system controls: use a centralised communication platform so information reaches everyone at the same time.',
    'Administrative controls: set minimum standards for what must be communicated, to whom, and by when.',
    'Supplementary support (not a substitute for the controls above): provide a direct channel for workers to ask questions and get timely answers when they feel out of the loop.',
  ],
  'Discrimination': [
    'Eliminate: redesign recruitment, promotion, and management systems so decisions cannot be made on the basis of a protected attribute.',
    'Minimise, substitution: replace subjective, discretion-heavy decision processes with structured, criteria-based decision-making.',
    'Minimise, isolation: remove a specific decision-maker from processes where discrimination has been substantiated, pending investigation or retraining.',
    'Minimise, engineering / system controls: use structured, auditable recruitment and promotion tools, e.g. blind screening or standardised criteria.',
    'Administrative controls: maintain and enforce an anti-discrimination policy with mandatory training and defined complaint pathways.',
    'Supplementary support (not a substitute for the controls above): provide independent support and counselling for workers who have experienced discrimination.',
  ],
  'Intrusive surveillance': [
    'Eliminate: remove monitoring that is not needed to manage a safety or security risk, such as constant tracking of calls, breaks or movements purely to measure individual performance.',
    'Minimise, substitution: replace individual, continuous performance tracking with team-based targets and periodic review of outputs.',
    'Minimise, isolation: confine any necessary monitoring (e.g. vehicle GPS for a safety purpose) to that purpose and to the people who need the data.',
    'Minimise, engineering / system controls: configure monitoring tools to collect only what is needed, set retention limits, and restrict who can see individual data.',
    'Administrative controls: consult workers when designing monitoring, publish a clear policy on what is monitored and why that is not excessive or punitive, and train supervisors in their supervisory role.',
    'Supplementary support (not a substitute for the controls above): encourage workers to raise concerns about monitoring early, and make sure they understand expectations and performance targets.',
  ],
}

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const

const LEGISLATION_BASE: Record<(typeof STATES)[number], string> = {
  NSW: 'WHS Regulation 2025 (NSW) cl 55A to 55D; Managing psychosocial hazards at work, Code of Practice 2021 (NSW)',
  VIC: 'Occupational Health and Safety Act 2004 (Vic); Occupational Health and Safety (Psychological Health) Regulations 2025 (Vic), in effect from 1 December 2025',
  QLD: 'WHS Regulation 2011 (Qld) s 55A to 55D; Managing the risk of psychosocial hazards at work, Code of Practice 2022 (Qld)',
  WA: 'Work Health and Safety Act 2020 (WA); Psychosocial hazards in the workplace, Code of practice (WA)',
  SA: 'WHS Regulations 2012 (SA) reg 55A to 55D; Managing psychosocial hazards at work, Code of Practice (SA), in effect from February 2026',
  TAS: 'WHS Regulations 2022 (Tas), psychosocial risk provisions; Managing psychosocial hazards at work, Code of Practice (Tas)',
  ACT: 'WHS Regulation 2011 (ACT) s 55A to 55D; Managing psychosocial hazards at work, Code of Practice 2023 (ACT)',
  NT: 'WHS (National Uniform Legislation) Regulations 2011 (NT) reg 55A to 55D; Managing psychosocial hazards at work, Code of Practice (NT)',
}

// Extra codes cited for specific hazards, in addition to each state's base citation.
const WA_BEHAVIOUR = new Set([
  'Workplace bullying',
  'Harassment including sexual harassment',
  'Discrimination',
  'Hostile work environment',
])

function legislationFor(hazard: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const state of STATES) {
    out[state] = LEGISLATION_BASE[state]
  }
  if (hazard === 'Harassment including sexual harassment') {
    out.SA += '; Sexual and Gender-Based Harassment Code of Practice (SA), in effect from 19 February 2026'
    out.NT += '; Sexual and gender-based harassment, Code of Practice (NT)'
  }
  if (WA_BEHAVIOUR.has(hazard)) out.WA += '; Workplace behaviour, Code of practice (WA)'
  if (hazard === 'Violence and aggression') out.WA += '; Violence and aggression at work, Code of practice (WA)'
  return out
}

const HAZARDS: { name: string; category: string; description: string }[] = [
  { name: 'High job demands', category: 'Job design', description: 'Sustained high workload, time pressure, or emotional/cognitive demand that exceeds a worker\'s capacity to cope. Sustained excess demand can lead to burnout.' },
  { name: 'Low job control', category: 'Job design', description: 'Workers have little say over how, when, or in what order their work is done. For workers in remote or FIFO accommodation, this includes control over accommodation arrangements.' },
  { name: 'Poor supervisor support', category: 'Support', description: 'Inadequate support, feedback, or resources provided by supervisors or managers.' },
  { name: 'Poor peer support', category: 'Support', description: 'Inadequate support or backup available from co-workers.' },
  { name: 'Lack of role clarity', category: 'Job design', description: 'Unclear expectations, objectives, or responsibilities within a role.' },
  { name: 'Poor organisational change management', category: 'Change & justice', description: 'Change is planned or communicated poorly, leaving workers uncertain or unprepared.' },
  { name: 'Low recognition and reward', category: 'Change & justice', description: 'Effort and performance are not adequately acknowledged or rewarded.' },
  { name: 'Poor procedural justice', category: 'Change & justice', description: 'Decisions affecting workers are made without fair, transparent, or consistent process.' },
  { name: 'Poor organisational justice', category: 'Change & justice', description: 'Outcomes for workers (workload, opportunity, discipline) are perceived as unfair.' },
  { name: 'Poor workplace relationships', category: 'Relationships', description: 'Ongoing low trust, poor communication or lack of respect between colleagues or with supervisors. The everyday quality of working relationships.' },
  { name: 'Remote or isolated work', category: 'Environment', description: 'Work performed alone or in isolation, with limited access to support or assistance.' },
  { name: 'Poor physical environment', category: 'Environment', description: 'Noise, temperature, air quality, crowding, or other physical conditions that add strain.' },
  { name: 'Violence and aggression', category: 'Conduct', description: 'Exposure to actual or threatened physical violence at work.' },
  { name: 'Workplace bullying', category: 'Conduct', description: 'Repeated, unreasonable behaviour directed at a worker that creates a risk to health and safety.' },
  { name: 'Harassment including sexual harassment', category: 'Conduct', description: 'Unwelcome conduct of a sexual or harassing nature that creates a hostile environment.' },
  { name: 'Conflict or poor interpersonal relationships', category: 'Relationships', description: 'A specific, unresolved dispute between individuals or teams.' },
  { name: 'Exposure to traumatic events or content', category: 'Trauma', description: 'Direct or vicarious exposure to distressing incidents, materials, or the aftermath of trauma.' },
  { name: 'Fatigue', category: 'Job design', description: 'Extended hours, inadequate rest breaks, or shift patterns that impair alertness and recovery.' },
  { name: 'Job insecurity', category: 'Change & justice', description: 'Uncertainty about the future availability or terms of a worker\'s job.' },
  { name: 'Hostile work environment', category: 'Conduct', description: 'A climate of intimidation, exclusion, or disrespect that undermines psychological safety.' },
  { name: 'High emotional labour demands', category: 'Job design', description: 'Requirement to manage or suppress emotions as part of the role (e.g. frontline, care, enforcement work).' },
  { name: 'Poor organisational communication', category: 'Change & justice', description: 'Information relevant to workers\' roles, safety, or the organisation is withheld, delayed, or unclear.' },
  { name: 'Intrusive surveillance', category: 'Job design', description: 'Excessive monitoring of workers\' performance, whether by supervisors (e.g. micromanagement) or technology (e.g. tracking, CCTV or GPS used to monitor performance rather than for safety or security). Monitoring for safety or security purposes can be appropriate.' },
  { name: 'Discrimination', category: 'Conduct', description: 'Unfavourable treatment of a worker based on a protected attribute.' },
]

export function seedHazardLibrary(db: DatabaseSync) {
  const insert = db.prepare(
    'INSERT INTO hazard_library (name, category, description, controls, legislation) VALUES (?, ?, ?, ?, ?)'
  )
  for (const h of HAZARDS) {
    const controls = HAZARD_CONTROLS[h.name]
    if (!controls) throw new Error(`No control hierarchy defined for hazard "${h.name}"`)
    insert.run(
      h.name,
      h.category,
      h.description,
      JSON.stringify(controls),
      JSON.stringify(legislationFor(h.name))
    )
  }
  console.log(`Seeded hazard library with ${HAZARDS.length} entries`)
}

// Brings an already-seeded database up to date: adds any hazard that is missing
// and rewrites description, category, controls and legislation by name. Safe to
// run on every start (idempotent); ids are never changed, so existing
// assessments stay linked.
export function syncHazardLibrary(db: DatabaseSync) {
  const exists = db.prepare('SELECT id FROM hazard_library WHERE name = ?')
  const insert = db.prepare(
    'INSERT INTO hazard_library (name, category, description, controls, legislation) VALUES (?, ?, ?, ?, ?)'
  )
  const update = db.prepare(
    'UPDATE hazard_library SET category = ?, description = ?, controls = ?, legislation = ? WHERE name = ?'
  )
  for (const h of HAZARDS) {
    const controls = JSON.stringify(HAZARD_CONTROLS[h.name])
    const legislation = JSON.stringify(legislationFor(h.name))
    if (exists.get(h.name)) update.run(h.category, h.description, controls, legislation, h.name)
    else insert.run(h.name, h.category, h.description, controls, legislation)
  }
}

export { HAZARD_CONTROLS }
