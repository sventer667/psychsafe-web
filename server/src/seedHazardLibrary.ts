import type { DatabaseSync } from 'node:sqlite'

// Six-level hierarchy of controls adapted for psychosocial hazards, applied
// to every library entry. This mirrors the standard WHS hierarchy of controls
// (eliminate -> substitute -> isolate -> engineering -> administrative -> PPE),
// re-expressed for psychosocial risk since there is no physical PPE equivalent.
function controlHierarchy(hazard: string): string[] {
  return [
    `Eliminate: redesign the work so the source of "${hazard.toLowerCase()}" is removed from the job entirely (e.g. remove the task, role, or exposure).`,
    `Substitute: change the way work is organised, scheduled, or assigned so the risk factor is replaced with a lower-risk alternative.`,
    `Isolate: separate workers from the hazard source where it cannot be removed (e.g. adjust reporting lines, rotate exposure, redistribute workload).`,
    `Engineering / system controls: change systems of work, staffing levels, technology, or scheduling to reduce exposure.`,
    `Administrative controls: introduce or update policies, procedures, training, and review cycles that limit exposure and duration.`,
    `Individual support: provide access to EAP, coaching, supervision, and early intervention for workers already affected.`,
  ]
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
    insert.run(
      h.name,
      h.category,
      h.description,
      JSON.stringify(controlHierarchy(h.name)),
      JSON.stringify(legislationFor(h.name))
    )
  }
  console.log(`Seeded hazard library with ${HAZARDS.length} entries`)
}
