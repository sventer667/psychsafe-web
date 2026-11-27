import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, FileSpreadsheet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public article: Victorian psychosocial risk: template or system?. Brand-only, no byline.
// Sets its own page title, description, canonical link and Article structured data while
// mounted (the app is a single-page app, so there is no per-route <head> to edit).

const TITLE = 'Victorian Psychosocial Risk: Template or System? | Humanora'
const DESCRIPTION =
  'A template or spreadsheet is a fine way to start managing psychosocial risk in Victoria. Where it starts to fall short, and three questions to help you decide.'
const PATH = '/articles/victoria-psychosocial-risk-template-or-system'

const GAP_CHECK = '/gap-check?utm_source=article&utm_medium=seo&utm_campaign=articles&utm_content=vic-template'

export function ArticleVictoriaTemplate() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const prevTitle = document.title
    document.title = TITLE

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    const createdMeta = !meta
    const prevDesc = meta?.getAttribute('content') ?? null
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', DESCRIPTION)

    const canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    canonical.setAttribute('href', `https://humanora.com.au${PATH}`)
    document.head.appendChild(canonical)

    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Victorian psychosocial risk: template or system?',
      description: DESCRIPTION,
      dateModified: '2026-11-27',
      mainEntityOfPage: `https://humanora.com.au${PATH}`,
      author: { '@type': 'Organization', name: 'Humanora' },
      publisher: { '@type': 'Organization', name: 'Humanora' },
    })
    document.head.appendChild(ld)

    return () => {
      document.title = prevTitle
      if (createdMeta) meta?.remove()
      else if (prevDesc !== null) meta?.setAttribute('content', prevDesc)
      canonical.remove()
      ld.remove()
    }
  }, [])

  return (
    <div className="bg-canvas">
      <header className="sticky top-0 z-10 bg-navy">
        <div className="h-[3px] bg-gradient-to-r from-accent via-accent to-navy" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src={logo} alt="Humanora" className="h-8 w-8 object-contain" />
            <div className="font-serif text-lg font-semibold text-navy-contrast">Humanora</div>
          </button>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate('/dashboard')}>Go to dashboard</Button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-sm font-medium text-navy-contrast/80 hover:text-navy-contrast">
                  Log in
                </button>
                <Button onClick={() => navigate('/signup')}>Start free trial</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/blog" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <FileSpreadsheet size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Victorian psychosocial risk: template or system?</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 27 November 2026. General information only, not legal advice.
        </p>

        <p className="mt-6 text-lg text-muted">
          A written prevention plan is not mandatory in Victoria. The Occupational Health and Safety (Psychological Health) Regulations 2025 ask you to identify hazards, control the risks, review your controls and consult your employees. They do not say which document you must use to do that, so a template or a spreadsheet is a legitimate way to start.
        </p>
        <p className="mt-4 text-muted">
          The real question is whether it will still give you a record you can rely on as your organisation grows. We sell a system, so weigh our view accordingly. For a small workplace, a template or spreadsheet may be all you need.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">When a template or spreadsheet is enough</h2>
        <p className="mt-3 text-muted">
          It works well when you have one site, a small number of hazards, and one person who owns the process and keeps it current. It also works when nobody is likely to ask how you know the record has not been edited since it was written. If that describes you, start there. It costs nothing, and it will teach you what the process involves.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Where it starts to struggle: an illustration</h2>
        <p className="mt-3 text-sm italic text-muted">
          This example is made up, to show the pattern. It is not a real customer.
        </p>
        <p className="mt-3 text-muted">
          A disability support provider in regional Victoria starts with a spreadsheet. The operations manager fills it in, and it works well. Two years later the organisation has three sites and nine managers, and the spreadsheet has become a folder of files.
        </p>
        <p className="mt-3 text-muted">
          Then a support worker reports being threatened by a client’s family member. That is a trigger for reviewing the controls. The manager acts quickly, but the review is only noted in an email, and nobody writes down that this report prompted it. Two managers each keep their own copy of the file, and when the board asks what was in place in March, nobody can say for sure. The consultation notes say “team meeting”, with nothing on what people said or what changed. An action to improve lone-worker check-ins has no owner, and it quietly stalls.
        </p>
        <p className="mt-3 text-muted">
          None of this is a failure of the spreadsheet. It was a good way to start, and the organisation has grown past what a file can hold.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Three questions to decide</h2>
        <p className="mt-3 text-muted">Answer these honestly for your own workplace.</p>
        <p className="mt-3 text-muted">
          If WorkSafe or your insurer asked for your psychosocial risk record tomorrow, could you produce one complete record per hazard within an hour? A complete record shows the hazard, how it was rated, the controls chosen and why, who was consulted, who owns each action, and when it was last reviewed.
        </p>
        <p className="mt-3 text-muted">Can you show who owns each action, and whether it was done?</p>
        <p className="mt-3 text-muted">Can you show that the record has not changed since the last review?</p>
        <p className="mt-3 text-muted">
          If you can answer yes to all three with your current template or spreadsheet, keep it and keep it up to date. If any answer is no, that is where a system earns its place.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What a system adds</h2>
        <p className="mt-3 text-muted">
          The problems in the example map to six things a file does not do on its own: record why a review happened, chase an action, prove a record is unaltered, keep one version, capture what people said in consultation, and produce a report for a board. A system is only worth having if it solves the ones you actually have.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">How Humanora helps</h2>
        <p className="mt-3 text-muted">
          Humanora keeps the hazard, the controls, the actions, the consultation and the review history on one assessment, so the record builds as you work.
        </p>
        <p className="mt-3 text-muted">
          You add hazards from a built-in library and rate them. If you set the assessment’s state to Victoria, the legislation references in your Risk Register and PDF report cite the Occupational Health and Safety Act 2004 and the Psychological Health Regulations 2025. Each library hazard comes with recommended controls, shown in order from changing the work itself through to individual support. They are a guide, and you decide what suits your workplace. Controls become actions on the Action Items tab, each with a named owner and due date. The dashboard shows what is overdue, and a banner in the app flags overdue actions.
        </p>
        <p className="mt-3 text-muted">
          You record consultation on the Consultation Log tab: the date, method, who attended (including your health and safety representative, if you have one) and a summary. You set how often to reassess, and Humanora shows when a review is due. When something triggers a review on an assessment that has already been sealed, you reopen it and record why, so the history shows what prompted it. When the assessment is finished, export the management report from the Report tab and seal it on the Overview tab. Sealing stores a cryptographic fingerprint and an independent timestamp, so you can show the record has not changed since it was closed.
        </p>
        <p className="mt-3 text-muted">
          Humanora does not replace legal advice, and it does not decide what is reasonably practicable for your workplace. It keeps the process and the evidence together.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What to do next</h2>
        <p className="mt-3 text-muted">
          To see where your records stand today, the free three-minute{' '}
          <Link to="/gap-check" className="text-accent hover:underline">Gap Check</Link> asks a few questions and shows the legislation for your state. To compare a system against your current file, you can start a free 7-day trial and run one real hazard through an assessment. For what the Regulations require, see our article on{' '}
          <Link to="/articles/victoria-psychological-health-regulations-checklist" className="text-accent hover:underline">what to do and what to keep</Link>{' '}
          and our{' '}
          <Link to="/guides/victoria-psychosocial-hazards" className="text-accent hover:underline">Victoria employer guide</Link>.
        </p>

        <Card className="mt-8 border-accent/30 bg-accent/5">
          <h3 className="font-serif text-lg text-ink">See where your records stand</h3>
          <p className="mt-1 text-sm text-muted">
            Our free three-minute Gap Check asks a few questions and shows the legislation for your state. No login needed.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => navigate(GAP_CHECK)} className="px-5 py-2.5">
              Run the free Gap Check <ArrowRight size={16} />
            </Button>
          </div>
        </Card>

        <p className="mt-6 text-sm italic text-muted">
          This article is general information, not legal advice. Check the current regulations and WorkSafe Victoria guidance, and take advice for your situation.
        </p>
      </article>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Humanora" className="h-6 w-6 object-contain" />
            <span>© {new Date().getFullYear()} Humanora</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/blog" className="hover:text-ink">Blog</Link>
            <Link to="/legal" className="hover:text-ink">Legal</Link>
            <Link to="/privacy" className="hover:text-ink">Privacy</Link>
            <Link to="/terms" className="hover:text-ink">Terms</Link>
            <Link to="/support" className="hover:text-ink">Support</Link>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="hover:text-ink">Go to dashboard</button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="hover:text-ink">Log in</button>
                <button onClick={() => navigate('/signup')} className="hover:text-ink">Sign up</button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
