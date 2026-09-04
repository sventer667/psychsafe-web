import type { DatabaseSync } from 'node:sqlite'

// Six-level hierarchy of controls adapted for psychosocial hazards
// (eliminate -> substitute -> isolate -> engineering -> administrative ->
// individual support, replacing PPE since there's no physical equivalent).
// Each hazard gets its own tailored set of controls rather than a shared
// template, so the guidance reflects how that specific hazard actually shows
// up at work. Grounded in Safe Work Australia's Model Code of Practice:
// Managing psychosocial hazards at work (July 2022).
const HAZARD_CONTROLS: Record<string, string[]> = {
  'High job demands': [
    'Eliminate: redesign the role or process to remove tasks that create sustained excessive workload, time pressure, or unreasonable deadlines (e.g. cut non-essential reporting, automate repetitive tasks).',
    'Substitute: reallocate peak-period work across a wider team or timeframe rather than concentrating it on a few workers.',
    'Isolate: cap the number of consecutive high-demand shifts or projects any one worker can be rostered onto without a lower-demand break.',
    'Engineering / system controls: use workload-forecasting and staffing tools to match resourcing to demand before it becomes unmanageable.',
    'Administrative controls: set realistic deadlines and KPIs, review workloads at regular intervals, and require manager sign-off before adding tasks to an already full workload.',
    'Individual support: provide time-management coaching and EAP access for workers experiencing demand-related strain.',
  ],
  'Low job control': [
    'Eliminate: redesign jobs to build in genuine autonomy over how, when, and in what order tasks are completed, rather than dictating every step.',
    'Substitute: replace rigid, top-down task allocation with team-based rostering or self-scheduling where operationally possible.',
    'Isolate: give workers control over the parts of the job that can be delegated (e.g. break timing, task sequencing) even where the overall process is fixed.',
    'Engineering / system controls: introduce rostering or workflow tools that let workers set preferences and see the reasoning behind decisions that affect them.',
    'Administrative controls: consult workers before finalising schedules or procedures, and provide a mechanism to request changes.',
    'Individual support: train supervisors to identify and respond to workers reporting low autonomy, and offer coaching on raising concerns constructively.',
  ],
  'Poor supervisor support': [
    'Eliminate: restructure reporting lines so no worker is left without an accessible, responsive supervisor.',
    'Substitute: replace absent or inconsistent supervision with a buddy system or acting-supervisor arrangement during gaps.',
    'Isolate: adjust team structure to separate a worker from a specific unsupportive supervisor while the underlying issue is addressed.',
    "Engineering / system controls: introduce structured check-in tools (e.g. scheduled 1:1 templates, escalation pathways) that don't rely solely on a supervisor's individual initiative.",
    'Administrative controls: set minimum standards for supervisor check-ins and feedback, and include them in supervisor performance reviews.',
    'Individual support: provide supervisor training in supportive leadership and psychosocial awareness, and EAP access for affected workers.',
  ],
  'Poor peer support': [
    'Eliminate: redesign work so no worker is required to perform high-risk or high-demand tasks in isolation from colleagues who could back them up.',
    'Substitute: replace ad hoc, informal peer backup with a rostered buddy or mentoring system.',
    'Isolate: rotate isolated workers back into team-based settings where peer contact is possible.',
    "Engineering / system controls: use team communication tools and shared channels so peer support doesn't depend on physical proximity.",
    'Administrative controls: build regular team meetings and peer-support check-ins into the schedule.',
    'Individual support: offer team-building activities and access to peer-support or mentoring programs.',
  ],
  'Lack of role clarity': [
    'Eliminate: redesign roles so responsibilities, authority, and reporting lines are unambiguous from the outset, removing overlapping or undefined duties.',
    'Substitute: replace informal or verbal role descriptions with clear, written position descriptions reviewed at onboarding and after any restructure.',
    "Isolate: where overlap between roles can't be immediately fixed, clarify decision rights for the specific tasks causing confusion.",
    'Engineering / system controls: maintain org charts, RACI matrices, or workflow documentation that is kept current and accessible.',
    'Administrative controls: require managers to confirm role expectations at induction and after any team or structural change.',
    'Individual support: offer 1:1 clarification sessions and coaching for workers uncertain about their responsibilities.',
  ],
  'Poor organisational change management': [
    "Eliminate: where change isn't essential, avoid disruptive restructuring; where it is, plan it with a documented change-management process from the start.",
    'Substitute: replace abrupt, top-down change announcements with staged rollouts that include consultation before decisions are finalised.',
    'Isolate: limit the number of concurrent major changes a team is exposed to at once.',
    "Engineering / system controls: use change-management frameworks and communication plans that set out what's changing, when, and why.",
    'Administrative controls: require consultation with affected workers and their representatives before change is implemented, per WHS consultation obligations.',
    'Individual support: provide transition support, EAP access, and clear points of contact for questions during change.',
  ],
  'Low recognition and reward': [
    'Eliminate: redesign performance and remuneration systems so effort and achievement are structurally recognised, not left to chance.',
    'Substitute: replace purely financial reward mechanisms, where inadequate or unavailable, with meaningful non-financial recognition such as development opportunities or public acknowledgement.',
    'Isolate: address recognition gaps for specific under-recognised roles or teams identified through survey data.',
    'Engineering / system controls: introduce formal recognition platforms or structured review processes that prompt timely acknowledgement.',
    'Administrative controls: set expectations and schedules for regular, fair performance feedback and recognition.',
    'Individual support: train managers in giving effective feedback and recognition, and provide coaching for workers feeling undervalued.',
  ],
  'Poor procedural justice': [
    'Eliminate: redesign decision-making processes so everyone affected by a decision is heard before it is made, removing unilateral or opaque processes.',
    'Substitute: replace informal, inconsistent decision-making with documented, consistent procedures applied the same way to everyone.',
    'Isolate: review and correct specific decisions made without proper process while the broader procedure is fixed.',
    'Engineering / system controls: use structured decision templates and approval workflows that build in consultation steps.',
    'Administrative controls: publish and train staff on the procedures used for decisions affecting them (e.g. rostering, discipline, promotion).',
    'Individual support: provide a clear appeals or grievance pathway and support for workers who feel a decision was unfair.',
  ],
  'Poor organisational justice': [
    'Eliminate: redesign systems that allocate workload, opportunity, or discipline so outcomes are equitable and rule-based rather than discretionary.',
    'Substitute: replace inconsistent, manager-dependent decisions with standardised criteria applied across the organisation.',
    'Isolate: correct specific instances of unequal treatment identified through review while systemic change is implemented.',
    'Engineering / system controls: use data and audit trails to monitor how workload, opportunities, and discipline are distributed across the workforce.',
    'Administrative controls: set and communicate clear, consistent criteria for how outcomes are decided.',
    'Individual support: provide a confidential channel for workers to raise perceived unfairness and have it reviewed.',
  ],
  'Poor workplace relationships': [
    'Eliminate: redesign team structures or reporting lines where a specific relationship breakdown is the root cause and cannot be resolved.',
    'Substitute: replace unmanaged interpersonal friction with structured conflict-resolution processes as the default response.',
    'Isolate: temporarily separate the parties involved in an unresolved conflict while mediation takes place.',
    'Engineering / system controls: introduce communication norms and team charters that set expectations for respectful interaction.',
    'Administrative controls: provide accessible, trained mediators or HR support for relationship breakdowns.',
    'Individual support: offer conflict-coaching or counselling to individuals affected by poor relationships at work.',
  ],
  'Remote or isolated work': [
    'Eliminate: redesign work so tasks requiring true isolation, such as solo remote sites, are reassigned or paired wherever practicable.',
    'Substitute: replace solo remote assignments with paired or team-based staffing for higher-risk locations or tasks.',
    "Isolate: where the isolation itself can't be removed, limit the duration of any single period of isolated work.",
    'Engineering / system controls: provide reliable communication technology such as check-in apps, duress alarms, or satellite communication for isolated workers.',
    'Administrative controls: set mandatory check-in schedules and emergency response procedures for remote or isolated workers.',
    'Individual support: provide mental health check-ins and EAP access tailored to the challenges of isolated work.',
  ],
  'Poor physical environment': [
    'Eliminate: redesign or relocate the workspace to remove the source of noise, poor air quality, extreme temperature, or overcrowding.',
    'Substitute: replace or upgrade equipment, layout, or materials contributing to poor conditions with better alternatives.',
    "Isolate: separate workers from the specific source of environmental strain where it can't be removed, e.g. sound barriers or dedicated quiet zones.",
    'Engineering / system controls: install ventilation, acoustic treatment, climate control, or layout changes to reduce exposure.',
    'Administrative controls: set maintenance schedules and workplace standards for temperature, noise, and space allocation.',
    'Individual support: provide access to quiet or low-stimulation break spaces and rest breaks during periods of environmental strain.',
  ],
  'Violence and aggression': [
    'Eliminate: redesign the service, layout, or task so workers are not exposed to situations with a known risk of violence, e.g. remove cash handling or restrict high-risk after-hours work.',
    'Substitute: replace face-to-face handling of high-risk interactions with remote, screened, or accompanied alternatives.',
    'Isolate: use physical barriers, secure work areas, or restricted access to separate workers from potentially violent individuals.',
    'Engineering / system controls: install duress alarms, CCTV, and secure entry/exit points in areas with violence risk.',
    'Administrative controls: implement and train staff in de-escalation procedures, incident reporting, and post-incident response plans.',
    'Individual support: provide trauma-informed counselling and EAP support immediately after any violent or threatening incident.',
  ],
  'Workplace bullying': [
    'Eliminate: redesign reporting lines or team structures where a specific pattern of bullying has been substantiated and cannot otherwise be stopped.',
    'Substitute: replace informal, unmonitored complaint handling with a formal, confidential bullying reporting and investigation process.',
    'Isolate: separate the parties involved, e.g. reassignment or altered reporting lines, while an investigation is underway.',
    'Engineering / system controls: use anonymous reporting tools and regular culture surveys to surface bullying before it escalates.',
    'Administrative controls: maintain and enforce an anti-bullying policy with clear consequences, and train managers to recognise early warning signs.',
    'Individual support: provide counselling and support for workers who have experienced bullying, and coaching for managers on early intervention.',
  ],
  'Harassment including sexual harassment': [
    'Eliminate: redesign work arrangements such as rostering, travel, or accommodation that create unsupervised or high-risk situations enabling harassment.',
    'Substitute: replace informal complaint-handling with a confidential, independent reporting and investigation channel.',
    'Isolate: remove the alleged harasser from contact with the affected worker during investigation, not the other way around.',
    "Engineering / system controls: use anonymous reporting platforms and exit-interview data to detect harassment that isn't otherwise reported.",
    'Administrative controls: maintain a clear anti-harassment policy, mandatory training, and defined investigation timelines consistent with the positive duty under the Sex Discrimination Act.',
    'Individual support: provide independent counselling support and a support person option for anyone involved in a complaint.',
  ],
  'Conflict or poor interpersonal relationships': [
    'Eliminate: redesign team composition or workflows where an unresolved, entrenched conflict is structurally embedded in how work is done.',
    'Substitute: replace avoidance or escalation-by-default with a structured, early conflict-resolution process.',
    'Isolate: temporarily adjust task allocation to reduce direct interaction between conflicting parties while resolution is pursued.',
    'Engineering / system controls: introduce clear communication channels and escalation pathways so conflict is raised before it entrenches.',
    'Administrative controls: train managers in early conflict identification and resolution, and set expectations for timely intervention.',
    'Individual support: offer mediation and individual coaching to those involved.',
  ],
  'Exposure to traumatic events or content': [
    'Eliminate: redesign workflows so exposure to traumatic material is limited to what is strictly necessary for the role, e.g. de-identify content or rotate reviewers.',
    'Substitute: replace direct human review of the most severe material with technology-assisted screening or triage where feasible.',
    "Isolate: limit the duration and frequency of any individual worker's direct exposure to traumatic content or incidents.",
    "Engineering / system controls: use content-blurring, warning systems, or exposure caps built into the tools workers use.",
    'Administrative controls: implement mandatory post-exposure debriefs and rotation policies for high-trauma-exposure roles.',
    'Individual support: provide trauma-informed clinical supervision, specialist counselling, and proactive psychological check-ins.',
  ],
  'Fatigue': [
    'Eliminate: redesign rosters and shift patterns to remove excessive hours or insufficient recovery time between shifts.',
    'Substitute: replace extended or back-to-back shift patterns with fatigue-managed rostering models.',
    'Isolate: limit the number of consecutive night shifts or extended shifts any worker can be rostered.',
    'Engineering / system controls: use fatigue-risk scoring software in rostering systems to flag high-risk schedules before they are assigned.',
    'Administrative controls: enforce mandatory minimum rest breaks between shifts and a fatigue-reporting procedure.',
    'Individual support: provide fatigue-awareness training and access to fitness-for-duty and sleep-health support.',
  ],
  'Job insecurity': [
    'Eliminate: redesign employment arrangements to offer ongoing roles where the work itself is ongoing, rather than repeated short-term contracts.',
    'Substitute: replace ambiguous or last-minute contract renewal practices with defined notice periods and renewal timelines.',
    "Isolate: where insecurity can't be removed for a role type, limit how many consecutive insecure contract cycles an individual experiences.",
    'Engineering / system controls: use workforce-planning systems that flag upcoming contract decisions early enough to give genuine notice.',
    'Administrative controls: communicate employment status and any restructuring plans as early and transparently as possible.',
    'Individual support: provide career transition support and EAP access for workers facing uncertain employment.',
  ],
  'Hostile work environment': [
    'Eliminate: redesign team culture interventions to remove entrenched norms of intimidation or exclusion, including leadership change where needed.',
    'Substitute: replace tolerance of hostile behaviour with a zero-tolerance, actively enforced code of conduct.',
    'Isolate: separate individuals identified as the source of hostility from the broader team while behaviour is addressed.',
    'Engineering / system controls: use culture surveys and anonymous feedback tools to detect hostility before it becomes entrenched.',
    'Administrative controls: set and enforce behavioural standards, with visible consequences for breaches.',
    'Individual support: offer counselling and a safe reporting channel for workers affected by a hostile environment.',
  ],
  'High emotional labour demands': [
    "Eliminate: redesign the role so it doesn't require sustained suppression or management of emotion beyond what's inherent to the task.",
    'Substitute: replace continuous front-facing emotional-labour tasks with rotation into lower-emotional-demand duties.',
    'Isolate: cap the length of any single shift or session spent on high-emotional-labour tasks, e.g. frontline complaints or crisis calls.',
    'Engineering / system controls: use scripting, triage systems, or technology to absorb the most emotionally demanding parts of an interaction.',
    'Administrative controls: build in structured breaks and debriefs after emotionally demanding interactions.',
    'Individual support: provide specialist training in emotional regulation and access to clinical supervision or counselling.',
  ],
  'Poor organisational communication': [
    "Eliminate: redesign information flows so decisions affecting workers' roles or safety are never withheld or delayed by default.",
    'Substitute: replace ad hoc or rumour-driven communication with scheduled, structured updates from a single source of truth.',
    'Isolate: identify and fix specific communication breakdowns, e.g. a team consistently left out of updates, while broader systems are improved.',
    'Engineering / system controls: use a centralised communication platform so information reaches everyone at the same time.',
    'Administrative controls: set minimum standards for what must be communicated, to whom, and by when.',
    'Individual support: provide a direct channel for workers to ask questions and get timely answers when they feel out of the loop.',
  ],
  'Discrimination': [
    'Eliminate: redesign recruitment, promotion, and management systems so decisions cannot be made on the basis of a protected attribute.',
    'Substitute: replace subjective, discretion-heavy decision processes with structured, criteria-based decision-making.',
    'Isolate: remove a specific decision-maker from processes where discrimination has been substantiated, pending investigation or retraining.',
    'Engineering / system controls: use structured, auditable recruitment and promotion tools, e.g. blind screening or standardised criteria.',
    'Administrative controls: maintain and enforce an anti-discrimination policy with mandatory training and defined complaint pathways.',
    'Individual support: provide independent support and counselling for workers who have experienced discrimination.',
  ],
}

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const

const LEGISLATION_BASE: Record<(typeof STATES)[number], string> = {
  NSW: 'WHS Regulation 2017 (NSW) cl 55; Managing psychosocial hazards at work, Code of Practice 2021 (NSW)',
  VIC: 'Occupational Health and Safety Act 2004 (Vic); Occupational Health and Safety (Psychological Health) Regulations 2025 (Vic), in effect from 1 December 2025',
  QLD: 'WHS Regulation 2011 (Qld) cl 55; Managing the risk of psychosocial hazards at work, Code of Practice 2022 (Qld)',
  WA: 'Work Health and Safety Act 2020 (WA); WHS (General) Regulations 2022 (WA) Part 3.2',
  SA: 'WHS Regulations 2012 (SA) cl 55; SafeWork SA psychosocial hazard guidance',
  TAS: 'WHS Regulations 2012 (Tas) cl 55; WorkSafe Tasmania psychosocial hazard guidance',
  ACT: 'WHS Regulation 2011 (ACT) cl 55; WorkSafe ACT psychosocial hazard guidance',
  NT: 'WHS (National Uniform Legislation) Regulations 2011 (NT) cl 55; NT WorkSafe psychosocial hazard guidance',
}

function legislationFor(hazard: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const state of STATES) {
    out[state] = LEGISLATION_BASE[state]
  }
  return out
}

const HAZARDS: { name: string; category: string; description: string }[] = [
  { name: 'High job demands', category: 'Job design', description: 'Sustained high workload, time pressure, or emotional/cognitive demand that exceeds a worker\'s capacity to cope.' },
  { name: 'Low job control', category: 'Job design', description: 'Workers have little say over how, when, or in what order their work is done.' },
  { name: 'Poor supervisor support', category: 'Support', description: 'Inadequate support, feedback, or resources provided by supervisors or managers.' },
  { name: 'Poor peer support', category: 'Support', description: 'Inadequate support or backup available from co-workers.' },
  { name: 'Lack of role clarity', category: 'Job design', description: 'Unclear expectations, objectives, or responsibilities within a role.' },
  { name: 'Poor organisational change management', category: 'Change & justice', description: 'Change is planned or communicated poorly, leaving workers uncertain or unprepared.' },
  { name: 'Low recognition and reward', category: 'Change & justice', description: 'Effort and performance are not adequately acknowledged or rewarded.' },
  { name: 'Poor procedural justice', category: 'Change & justice', description: 'Decisions affecting workers are made without fair, transparent, or consistent process.' },
  { name: 'Poor organisational justice', category: 'Change & justice', description: 'Outcomes for workers (workload, opportunity, discipline) are perceived as unfair.' },
  { name: 'Poor workplace relationships', category: 'Relationships', description: 'Interpersonal conflict, poor communication, or breakdown in trust between colleagues.' },
  { name: 'Remote or isolated work', category: 'Environment', description: 'Work performed alone or in isolation, with limited access to support or assistance.' },
  { name: 'Poor physical environment', category: 'Environment', description: 'Noise, temperature, air quality, crowding, or other physical conditions that add strain.' },
  { name: 'Violence and aggression', category: 'Conduct', description: 'Exposure to actual or threatened physical violence at work.' },
  { name: 'Workplace bullying', category: 'Conduct', description: 'Repeated, unreasonable behaviour directed at a worker that creates a risk to health and safety.' },
  { name: 'Harassment including sexual harassment', category: 'Conduct', description: 'Unwelcome conduct of a sexual or harassing nature that creates a hostile environment.' },
  { name: 'Conflict or poor interpersonal relationships', category: 'Relationships', description: 'Ongoing unresolved conflict between individuals or teams.' },
  { name: 'Exposure to traumatic events or content', category: 'Trauma', description: 'Direct or vicarious exposure to distressing incidents, materials, or the aftermath of trauma.' },
  { name: 'Fatigue', category: 'Job design', description: 'Extended hours, inadequate rest breaks, or shift patterns that impair alertness and recovery.' },
  { name: 'Job insecurity', category: 'Change & justice', description: 'Uncertainty about the future availability or terms of a worker\'s job.' },
  { name: 'Hostile work environment', category: 'Conduct', description: 'A climate of intimidation, exclusion, or disrespect that undermines psychological safety.' },
  { name: 'High emotional labour demands', category: 'Job design', description: 'Requirement to manage or suppress emotions as part of the role (e.g. frontline, care, enforcement work).' },
  { name: 'Poor organisational communication', category: 'Change & justice', description: 'Information relevant to workers\' roles, safety, or the organisation is withheld, delayed, or unclear.' },
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

export { HAZARD_CONTROLS }
