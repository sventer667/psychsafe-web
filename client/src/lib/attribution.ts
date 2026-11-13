// Records which page or campaign link first brought a visitor to Humanora, so a Gap Check
// lead or a new account can be tied back to its source. Stores campaign tags (utm_*), the
// referring site's domain (domain only, never the full URL) and the landing path in this
// browser's local storage. No cookies, no personal data.

const KEY = 'humanora_attribution'
const OWN_HOSTS = ['humanora.com.au', 'www.humanora.com.au', 'connexus-app.onrender.com']

export type Attribution = {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  referrerHost: string
  landingPath: string
  ctaSource: string
  ctaContent: string
}

function clean(value: string | null | undefined): string {
  return (value || '').slice(0, 100).replace(/[^A-Za-z0-9 _.:/+-]/g, '')
}

function read(): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Attribution) : null
  } catch {
    return null
  }
}

function write(value: Attribution) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // Storage unavailable (private mode, blocked): attribution is simply skipped.
  }
}

// Call once on every page load. The first visit sets the source. A later page opened with
// campaign tags (such as the Gap Check button inside an article) only updates the
// "call to action" fields, so the original source is kept.
export function captureAttribution() {
  const params = new URLSearchParams(window.location.search)
  const source = clean(params.get('utm_source'))
  const medium = clean(params.get('utm_medium'))
  const campaign = clean(params.get('utm_campaign'))
  const content = clean(params.get('utm_content'))
  const tagged = Boolean(source || medium || campaign || content)

  const existing = read()
  if (!existing) {
    let referrerHost = ''
    try {
      const host = document.referrer ? new URL(document.referrer).hostname : ''
      referrerHost = OWN_HOSTS.includes(host) ? '' : clean(host)
    } catch {
      referrerHost = ''
    }
    write({
      utmSource: source,
      utmMedium: medium,
      utmCampaign: campaign,
      utmContent: content,
      referrerHost,
      landingPath: clean(window.location.pathname),
      ctaSource: tagged ? source : '',
      ctaContent: tagged ? content : '',
    })
    return
  }
  if (tagged) {
    write({ ...existing, ctaSource: source, ctaContent: content })
  }
}

export function getAttribution(): Attribution | null {
  return read()
}
