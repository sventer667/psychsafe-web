import { Pickaxe, Stethoscope, HardHat, GraduationCap, Truck, Siren, type LucideIcon } from 'lucide-react'

// Sector-specific marketing content for the public site (Home + the per-sector
// guide pages). This is original copy written for Connexus, describing which
// of the 22 hazards in the actual in-app hazard library tend to be most
// prominent in each sector, it isn't pulled live from app data (the app's
// hazard library itself isn't filtered by industry today), so hazard names
// here are kept in sync with server/src/seedHazardLibrary.ts by hand.

export interface Sector {
  slug: string
  icon: LucideIcon
  name: string
  cardSummary: string
  guideIntro: string
  hazards: { name: string; description: string }[]
  legislationNote: string
}

// Sectors are listed alphabetically by name (not by industry risk level or
// company size), a deliberate, principled ordering rather than an arbitrary
// one, so the displayed order doesn't happen to mirror any other vendor's list.
export const SECTORS: Sector[] = [
  {
    slug: 'construction',
    icon: HardHat,
    name: 'Construction',
    cardSummary:
      'Project-based schedules, subcontractor turnover, and job insecurity between projects create psychosocial risk that sits outside a standard site safety plan.',
    guideIntro:
      'Construction\'s project-based structure means teams form and disband repeatedly, workloads spike toward deadlines, and a large share of the workforce moves between employers as subcontractors. That structure creates its own psychosocial risk pattern, distinct from the physical hazards already covered on most sites.',
    hazards: [
      { name: 'Job insecurity', description: 'Uncertainty about the future availability or terms of a worker\'s job between projects.' },
      { name: 'Poor organisational communication', description: 'Information relevant to workers\' roles, safety, or the organisation is withheld, delayed, or unclear across subcontracted teams.' },
      { name: 'Fatigue', description: 'Extended hours, inadequate rest breaks, or shift patterns that impair alertness and recovery, especially toward project deadlines.' },
      { name: 'Poor workplace relationships', description: 'Interpersonal conflict, poor communication, or breakdown in trust between colleagues and contractors.' },
    ],
    legislationNote:
      'A PCBU\'s WHS duty doesn\'t end at the head contractor, principal contractors and subcontracting employers each carry a duty to manage psychosocial risk for their own workers so far as reasonably practicable, including risk arising from project structure and job insecurity, not only fall and plant hazards.',
  },
  {
    slug: 'education',
    icon: GraduationCap,
    name: 'Education',
    cardSummary:
      'Escalating workload, student or parent conduct issues, and blurred after-hours boundaries are measurable psychosocial hazards, not just part of the job.',
    guideIntro:
      'Teaching and education support roles carry a duty of care that extends well beyond the physical classroom, workload that grows without a matching reduction elsewhere, and increasingly, direct exposure to challenging student or parent behaviour.',
    hazards: [
      { name: 'High job demands', description: 'Sustained high workload, time pressure, or emotional demand, including work that extends into personal time.' },
      { name: 'Hostile work environment', description: 'A climate of intimidation, exclusion, or disrespect that undermines psychological safety, including from students, parents, or colleagues.' },
      { name: 'Lack of role clarity', description: 'Unclear expectations, objectives, or responsibilities within a role, common where duties expand informally.' },
      { name: 'Low recognition and reward', description: 'Effort and performance are not adequately acknowledged or rewarded.' },
    ],
    legislationNote:
      'Education employers carry the same PCBU duty as any other workplace: identify psychosocial hazards such as workload and student or parent conduct, and eliminate or minimise them so far as reasonably practicable. A code of conduct for students doesn\'t substitute for that risk assessment; it sits alongside it.',
  },
  {
    slug: 'emergency-services',
    icon: Siren,
    name: 'Emergency Services',
    cardSummary:
      'Repeated exposure to traumatic incidents, shift-based fatigue, and high emotional labour place emergency workers at sustained risk of psychological injury.',
    guideIntro:
      'Emergency services work involves repeated, and often cumulative, exposure to traumatic incidents, layered on top of shift work fatigue and the emotional labour of staying composed under pressure. The risk compounds over a career rather than resetting after each incident.',
    hazards: [
      { name: 'Exposure to traumatic events or content', description: 'Direct or vicarious exposure to distressing incidents, materials, or the aftermath of trauma.' },
      { name: 'Fatigue', description: 'Extended hours, inadequate rest breaks, or shift patterns that impair alertness and recovery.' },
      { name: 'High emotional labour demands', description: 'Requirement to manage or suppress emotions as part of frontline, care, or enforcement work.' },
      { name: 'Poor supervisor support', description: 'Inadequate support, feedback, or resources provided by supervisors or managers, including after critical incidents.' },
    ],
    legislationNote:
      'Emergency services agencies carry a PCBU duty to manage cumulative trauma exposure and fatigue as psychosocial hazards in their own right, not only as outcomes to be treated after the fact. Structured post-incident debriefing and roster design are both part of eliminating or minimising that risk so far as reasonably practicable.',
  },
  {
    slug: 'healthcare-aged-care',
    icon: Stethoscope,
    name: 'Healthcare & Aged Care',
    cardSummary:
      'Chronic understaffing, patient or resident aggression, and emotionally demanding care work place healthcare among the highest-risk sectors for psychosocial harm.',
    guideIntro:
      'Healthcare and aged care roles combine emotionally demanding direct care with, in many settings, real exposure to aggression from patients, residents, or family members. Understaffing compounds both, turning a manageable caseload into sustained high job demands.',
    hazards: [
      { name: 'High emotional labour demands', description: 'Requirement to manage or suppress emotions as part of frontline, care, or enforcement work.' },
      { name: 'Violence and aggression', description: 'Exposure to actual or threatened physical violence at work, including from patients or residents.' },
      { name: 'High job demands', description: 'Sustained high workload, time pressure, or emotional demand that exceeds a worker\'s capacity to cope.' },
      { name: 'Poor supervisor support', description: 'Inadequate support, feedback, or resources provided by supervisors or managers.' },
    ],
    legislationNote:
      'The same WHS duty that covers manual handling and infection control extends to psychosocial hazards: a PCBU must identify risks like aggression from patients or residents and workload, and eliminate or minimise them so far as reasonably practicable. Treating a violent incident as a one-off HR matter, rather than a hazard to be assessed and controlled, falls short of that duty.',
  },
  {
    slug: 'mining-resources',
    icon: Pickaxe,
    name: 'Mining & Resources',
    cardSummary:
      'FIFO rosters, remote sites, and high-consequence work create fatigue and isolation that a generic risk register tends to miss.',
    guideIntro:
      'Mining and resources work combines long rosters, physically remote sites, and safety-critical decision-making. That mix produces a psychosocial risk profile built around fatigue and isolation, alongside the sustained high job demands common to safety-critical roles.',
    hazards: [
      { name: 'Fatigue', description: 'Extended hours, inadequate rest breaks, or shift and roster patterns (including FIFO swings) that impair alertness and recovery.' },
      { name: 'Remote or isolated work', description: 'Work performed alone or in isolation, with limited access to support or assistance on site.' },
      { name: 'High job demands', description: 'Sustained high workload, time pressure, or cognitive demand in safety-critical roles that exceeds a worker\'s capacity to cope.' },
      { name: 'Exposure to traumatic events or content', description: 'Direct or vicarious exposure to distressing incidents, near-misses, or their aftermath.' },
    ],
    legislationNote:
      'Under the WHS Regulations in each state and territory, a PCBU\'s duty to manage psychosocial risk covers fatigue and isolation the same way it covers a fall hazard: identify it, assess it, and eliminate or minimise it so far as reasonably practicable. Roster design and site communication plans for remote crews fall squarely inside that duty, not outside it.',
  },
  {
    slug: 'transport-logistics',
    icon: Truck,
    name: 'Transport & Logistics',
    cardSummary:
      'Long solo hours, tight delivery windows, and exposure to customer aggression make fatigue and isolation the two most common psychosocial hazards on the road.',
    guideIntro:
      'Driving and logistics roles spend most of a shift away from direct supervision or peer support, under delivery-window time pressure, with fatigue risk built into the roster itself. Aggression from customers or the public adds a further layer most risk registers don\'t capture.',
    hazards: [
      { name: 'Fatigue', description: 'Extended hours, inadequate rest breaks, or shift patterns that impair alertness and recovery.' },
      { name: 'Remote or isolated work', description: 'Work performed alone or in isolation, with limited access to support or assistance for most of a shift.' },
      { name: 'Violence and aggression', description: 'Exposure to actual or threatened physical violence at work, including from members of the public.' },
      { name: 'High job demands', description: 'Sustained high workload, time pressure, or cognitive demand that exceeds a worker\'s capacity to cope.' },
    ],
    legislationNote:
      'A transport or logistics PCBU\'s duty to manage psychosocial risk applies whether a worker is on site or on the road: fatigue-inducing schedules and exposure to public aggression both need to be identified and controlled so far as reasonably practicable, not treated as an unavoidable cost of the job.',
  },
]

export function getSector(slug: string | undefined): Sector | undefined {
  return SECTORS.find((s) => s.slug === slug)
}
import { Pickaxe, Stethoscope, HardHat, GraduationCap, Truck, Siren, type LucideIcon } from 'lucide-react'

// Sector-specific marketing content for the public site (Home + the per-sector
// guide pages). This is original copy written for Connexus, describing which
// of the 22 hazards in the actual in-app hazard library tend to be most
// prominent in each sector, it isn't pulled live from app data (the app's
// hazard library itself isn't filtered by industry today), so hazard names
// here are kept in sync with server/src/seedHazardLibrary.ts by hand.

export interface Sector {
  slug: string
  icon: LucideIcon
  name: string
  cardSummary: string
  guideIntro: string
  hazards: { name: string; description: string }[]
  legislationNote: string
}

// Sectors are listed alphabetically by name (not by industry risk level or
// company size), a deliberate, principled ordering rather than an arbitrary
// one, so the displayed order doesn't happen to mirror any other vendor's list.
export const SECTORS: Sector[] = [
  {
    slug: 'construction',
    icon: HardHat,
    name: 'Construction',
    cardSummary:
      'Project-based schedules, subcontractor turnover, and job insecurity between projects create psychosocial risk that sits outside a standard site safety plan.',
    guideIntro:
      'Construction\'s project-based structure means teams form and disband repeatedly, workloads spike toward deadlines, and a large share of the workforce moves between employers as subcontractors. That structure creates its own psychosocial risk pattern, distinct from the physical hazards already covered on most sites.',
    hazards: [
      { name: 'Job insecurity', description: 'Uncertainty about the future availability or terms of a worker\'s job between projects.' },
      { name: 'Poor organisational communication', description: 'Information relevant to workers\' roles, safety, or the organisation is withheld, delayed, or unclear across subcontracted teams.' },
      { name: 'Fatigue', description: 'Extended hours, inadequate rest breaks, or shift patterns that impair alertness and recovery, especially toward project deadlines.' },
      { name: 'Poor workplace relationships', description: 'Interpersonal conflict, poor communication, or breakdown in trust between colleagues and contractors.' },
    ],
    legislationNote:
      'A PCBU\'s WHS duty doesn\'t end at the head contractor, principal contractors and subcontracting employers each carry a duty to manage psychosocial risk for their own workers so far as reasonably practicable, including risk arising from project structure and job insecurity, not only fall and plant hazards.',
  },
  {
    slug: 'education',
    icon: GraduationCap,
    name: 'Education',
    cardSummary:
      'Escalating workload, student or parent conduct issues, and blurred after-hours boundaries are measurable psychosocial hazards, not just part of the job.',
    guideIntro:
      'Teaching and education support roles carry a duty of care that extends well beyond the physical classroom, workload that grows without a matching reduction elsewhere, and increasingly, direct exposure to challenging student or parent behaviour.',
    hazards: [
      { name: 'High job demands', description: 'Sustained high workload, time pressure, or emotional demand, including work that extends into personal time.' },
      { name: 'Hostile work environment', description: 'A climate of intimidation, exclusion, or disrespect that undermines psychological safety, including from students, parents, or colleagues.' },
      { name: 'Lack of role clarity', description: 'Unclear expectations, objectives, or responsibilities within a role, common where duties expand informally.' },
      { name: 'Low recognition and reward', description: 'Effort and performance are not adequately acknowledged or rewarded.' },
    ],
    legislationNote:
      'Education employers carry the same PCBU duty as any other workplace: identify psychosocial hazards such as workload and student or parent conduct, and eliminate or minimise them so far as reasonably practicable. A code of conduct for students doesn\'t substitute for that risk assessment; it sits alongside it.',
  },
  {
    slug: 'emergency-services',
    icon: Siren,
    name: 'Emergency Services',
    cardSummary:
      'Repeated exposure to traumatic incidents, shift-based fatigue, and high emotional labour place emergency workers at sustained risk of psychological injury.',
    guideIntro:
      'Emergency services work involves repeated, and often cumulative, exposure to traumatic incidents, layered on top of shift work fatigue and the emotional labour of staying composed under pressure. The risk compounds over a career rather than resetting after each incident.',
    hazards: [
      { name: 'Exposure to traumatic events or content', description: 'Direct or vicarious exposure to distressing incidents, materials, or the aftermath of trauma.' },
      { name: 'Fatigue', description: 'Extended hours, inadequate rest breaks, or shift patterns that impair alertness and recovery.' },
      { name: 'High emotional labour demands', description: 'Requirement to manage or suppress emotions as part of frontline, care, or enforcement work.' },
      { name: 'Poor supervisor support', description: 'Inadequate support, feedback, or resources provided by supervisors or managers, including after critical incidents.' },
    ],
    legislationNote:
      'Emergency services agencies carry a PCBU duty to manage cumulative trauma exposure and fatigue as psychosocial hazards in their own right, not only as outcomes to be treated after the fact. Structured post-incident debriefing and roster design are both part of eliminating or minimising that risk so far as reasonably practicable.',
  },
  {
    slug: 'healthcare-aged-care',
    icon: Stethoscope,
    name: 'Healthcare & Aged Care',
    cardSummary:
      'Chronic understaffing, patient or resident aggression, and emotionally demanding care work place healthcare among the highest-risk sectors for psychosocial harm.',
    guideIntro:
      'Healthcare and aged care roles combine emotionally demanding direct care with, in many settings, real exposure to aggression from patients, residents, or family members. Understaffing compounds both, turning a manageable caseload into sustained high job demands.',
    hazards: [
      { name: 'High emotional labour demands', description: 'Requirement to manage or suppress emotions as part of frontline, care, or enforcement work.' },
      { name: 'Violence and aggression', description: 'Exposure to actual or threatened physical violence at work, including from patients or residents.' },
      { name: 'High job demands', description: 'Sustained high workload, time pressure, or emotional demand that exceeds a worker\'s capacity to cope.' },
      { name: 'Poor supervisor support', description: 'Inadequate support, feedback, or resources provided by supervisors or managers.' },
    ],
    legislationNote:
      'The same WHS duty that covers manual handling and infection control extends to psychosocial hazards: a PCBU must identify risks like aggression from patients or residents and workload, and eliminate or minimise them so far as reasonably practicable. Treating a violent incident as a one-off HR matter, rather than a hazard to be assessed and controlled, falls short of that duty.',
  },
  {
    slug: 'mining-resources',
    icon: Pickaxe,
    name: 'Mining & Resources',
    cardSummary:
      'FIFO rosters, remote sites, and high-consequence work create fatigue and isolation that a generic risk register tends to miss.',
    guideIntro:
      'Mining and resources work combines long rosters, physically remote sites, and safety-critical decision-making. That mix produces a psychosocial risk profile built around fatigue and isolation, alongside the sustained high job demands common to safety-critical roles.',
    hazards: [
      { name: 'Fatigue', description: 'Extended hours, inadequate rest breaks, or shift and roster patterns (including FIFO swings) that impair alertness and recovery.' },
      { name: 'Remote or isolated work', description: 'Work performed alone or in isolation, with limited access to support or assistance on site.' },
      { name: 'High job demands', description: 'Sustained high workload, time pressure, or cognitive demand in safety-critical roles that exceeds a worker\'s capacity to cope.' },
      { name: 'Exposure to traumatic events or content', description: 'Direct or vicarious exposure to distressing incidents, near-misses, or their aftermath.' },
    ],
    legislationNote:
      'Under the WHS Regulations in each state and territory, a PCBU\'s duty to manage psychosocial risk covers fatigue and isolation the same way it covers a fall hazard: identify it, assess it, and eliminate or minimise it so far as reasonably practicable. Roster design and site communication plans for remote crews fall squarely inside that duty, not outside it.',
  },
  {
    slug: 'transport-logistics',
    icon: Truck,
    name: 'Transport & Logistics',
    cardSummary:
      'Long solo hours, tight delivery windows, and exposure to customer aggression make fatigue and isolation the two most common psychosocial hazards on the road.',
    guideIntro:
      'Driving and logistics roles spend most of a shift away from direct supervision or peer support, under delivery-window time pressure, with fatigue risk built into the roster itself. Aggression from customers or the public adds a further layer most risk registers don't capture.',
    hazards: [
      { name: 'Fatigue', description: 'Extended hours, inadequate rest breaks, or shift patterns that impair alertness and recovery.' },
      { name: 'Remote or isolated work', description: 'Work performed alone or in isolation, with limited access to support or assistance for most of a shift.' },
      { name: 'Violence and aggression', description: 'Exposure to actual or threatened physical violence at work, including from members of the public.' },
      { name: 'High job demands', description: 'Sustained high workload, time pressure, or cognitive demand that exceeds a worker\'s capacity to cope.' },
    ],
    legislationNote:
      'A transport or logistics PCBU\'s duty to manage psychosocial risk applies whether a worker is on site or on the road: fatigue-inducing schedules and exposure to public aggression both need to be identified and controlled so far as reasonably practicable, not treated as an unavoidable cost of the job.',
  },
]

export function getSector(slug: string | undefined): Sector | undefined {
  return SECTORS.find((s) => s.slug === slug)
}
