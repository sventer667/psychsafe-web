// Post-build step: writes a copy of the built index.html for each public route
// with that page's own <title>, description, canonical link and Open Graph tags
// (plus JSON-LD where the page doesn't add its own), so crawlers that don't run
// JavaScript still see the right metadata. The app itself is unchanged.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = 'https://humanora.com.au'
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Read the TITLE/DESCRIPTION/PATH constants straight from each page file.
function constFrom(file, name) {
  const src = readFileSync(join(root, 'src/pages', file), 'utf8')
  const m = src.match(new RegExp(`const ${name} =\\s*'((?:[^'\\\\]|\\\\.)*)'`))
  if (!m) throw new Error(`${name} not found in ${file}`)
  return m[1].replace(/\\'/g, "'")
}

const routes = []
const pageFiles = {
  '/gap-check': null,
  '/guides': 'Guides.tsx',
  '/blog': 'Blog.tsx',
  '/help': 'Help.tsx',
  '/contact': 'Contact.tsx',
  '/guides/victoria-psychosocial-hazards': 'GuideVictoria.tsx',
  '/guides/nsw-psychosocial-hazards': 'GuideNSW.tsx',
  '/guides/queensland-psychosocial-hazards': 'GuideQLD.tsx',
  '/guides/tasmania-psychosocial-hazards': 'GuideTAS.tsx',
  '/guides/act-psychosocial-hazards': 'GuideACT.tsx',
  '/guides/wa-psychosocial-hazards': 'GuideWA.tsx',
  '/guides/sa-psychosocial-hazards': 'GuideSA.tsx',
  '/guides/nt-psychosocial-hazards': 'GuideNT.tsx',
  '/articles/psychosocial-risk-register': 'ArticleRiskRegister.tsx',
  '/articles/recording-worker-consultation-psychosocial-hazards': 'ArticleConsultation.tsx',
  '/articles/psychosocial-risk-assessment-four-steps': 'ArticleAssessment.tsx',
  '/articles/psychosocial-hazard-examples-and-controls': 'ArticleHazards.tsx',
  '/articles/how-often-to-review-psychosocial-controls': 'ArticleReview.tsx',
  '/articles/officers-due-diligence-psychosocial-hazards': 'ArticleOfficers.tsx',
  '/articles/first-psychosocial-risk-assessment-humanora': 'ArticleFirstAssessment.tsx',
  '/articles/victoria-psychosocial-risk-template-or-system': 'ArticleVictoriaTemplate.tsx',
  '/articles/victoria-psychological-health-regulations-checklist': 'ArticleVictoriaChecklist.tsx',
}
for (const [path, file] of Object.entries(pageFiles)) {
  if (!file) continue
  const p = constFrom(file, 'PATH')
  if (p !== path) throw new Error(`PATH mismatch ${file}: ${p} vs ${path}`)
  routes.push({ path, title: constFrom(file, 'TITLE'), description: constFrom(file, 'DESCRIPTION') })
}

// Home and Gap Check text is defined here and mirrored in the pages.
const HOME = {
  path: '/',
  title: 'Psychosocial Risk Assessment Software for Australian Workplaces | Humanora',
  description:
    'Humanora is psychosocial risk management software for Australian employers. Assess hazards, assign actions, log worker consultation and seal a tamper-evident record.',
}
routes.push({
  path: '/gap-check',
  title: 'Free Psychosocial Risk Gap Check (3 Minutes) | Humanora',
  description:
    'A free three minute check of your psychosocial risk records against what Australian WHS law requires. No credit card, and no email needed until you want your result.',
})

// Sector pages: title/description built from src/lib/sectors.ts.
const sectorSrc = readFileSync(join(root, 'src/lib/sectors.ts'), 'utf8')
const blocks = sectorSrc.split(/\n  \{\n    slug: /).slice(1)
for (const b of blocks) {
  const slug = b.match(/^'([^']+)'/)[1]
  const name = b.match(/\n    name: '((?:[^'\\]|\\.)*)'/)[1].replace(/\\'/g, "'")
  const hz = [...b.matchAll(/\{ name: '((?:[^'\\]|\\.)*)', description:/g)].slice(0, 2).map((m) => m[1].replace(/\\'/g, "'").toLowerCase())
  routes.push({
    path: `/sectors/${slug}`,
    title: `Psychosocial Hazards in ${name}: Risk Assessment | Humanora`,
    description: `The psychosocial hazards most common in ${name.toLowerCase()} work, such as ${hz[0]} and ${hz[1]}, and how to assess and record them under WHS law.`,
  })
}

// JSON-LD only where the page doesn't add its own in the browser.
const faqSrc = readFileSync(join(root, 'src/pages/Help.tsx'), 'utf8')
const faqBlock = faqSrc.match(/const FAQS[^=]*=\s*(\[[\s\S]*?\n\])\n/)[1]
const FAQS = new Function(`return ${faqBlock}`)()
const ld = {
  '/': [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Humanora',
      url: `${SITE}/`,
      logo: `${SITE}/apple-touch-icon.png`,
      email: 'contact@humanora.com.au',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Humanora',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: HOME.description,
      url: `${SITE}/`,
      offers: [
        { '@type': 'Offer', name: 'Starter', price: '89', priceCurrency: 'AUD' },
        { '@type': 'Offer', name: 'Growth', price: '179', priceCurrency: 'AUD' },
        { '@type': 'Offer', name: 'Enterprise', price: '599', priceCurrency: 'AUD' },
      ],
    },
  ],
  '/help': [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
}

function render(r) {
  const url = `${SITE}${r.path === '/' ? '/' : r.path}`
  let h = template
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`)
  h = h.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(r.description)}" />`)
  h = h.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(r.title)}" />`)
  h = h.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(r.description)}" />`)
  h = h.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
  h = h.replace(/<meta property="og:image:alt"[^>]*>/, `<meta property="og:image:alt" content="${esc(r.title)}" />`)
  // The root file is also the fallback served for every other route, so it must
  // not claim a canonical URL or og:url of its own.
  if (r.path === '/') h = h.replace(/\s*<meta property="og:url"[^>]*>/, '')
  let extra = r.path === '/' ? '' : `<link rel="canonical" href="${url}" data-prerender="canonical" />`
  for (const o of ld[r.path] ?? []) extra += `\n    <script type="application/ld+json" data-prerender="ld">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`
  return h.replace('</head>', `    ${extra}\n  </head>`)
}

for (const r of [HOME, ...routes]) {
  const html = render(r)
  if (r.path === '/') {
    writeFileSync(join(dist, 'index.html'), html)
  } else {
    const dir = join(dist, r.path)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), html)
  }
}
console.log(`prerendered ${routes.length + 1} routes`)
