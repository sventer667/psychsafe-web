// Campaign / referrer attribution for Gap Check leads and new accounts. The browser sends a
// small object (see client/src/lib/attribution.ts); everything is treated as untrusted text,
// trimmed and restricted to plain characters before it is stored.

export const ATTRIBUTION_COLUMNS = [
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmContent',
  'referrerHost',
  'landingPath',
  'ctaSource',
  'ctaContent',
] as const

export type AttributionColumn = (typeof ATTRIBUTION_COLUMNS)[number]
export type Attribution = Record<AttributionColumn, string>

function clean(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.slice(0, 100).replace(/[^A-Za-z0-9 _.:/+-]/g, '')
}

export function readAttribution(raw: unknown): Attribution {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const out = {} as Attribution
  for (const col of ATTRIBUTION_COLUMNS) out[col] = clean(src[col])
  return out
}

// currentSetup is the list of ticked options on the Gap Check ("how do you manage this today").
export function readCurrentSetup(raw: unknown): string {
  if (!Array.isArray(raw)) return '[]'
  const items = raw.filter((v): v is string => typeof v === 'string').slice(0, 10).map((v) => v.slice(0, 100))
  return JSON.stringify(items)
}
