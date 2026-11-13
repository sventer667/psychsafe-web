import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, CalendarClock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public article: how to record worker consultation on psychosocial hazards. Brand-only, no byline.
// Sets its own page title, description, canonical link and Article structured data while
// mounted (the app is a single-page app, so there is no per-route <head> to edit).

const TITLE = 'How Often to Review Psychosocial Controls | Humanora'
const DESCRIPTION =
  'The model code says to review psychosocial controls regularly and sets out when a review is required. How to turn that into a schedule, with the triggers and a simple review checklist.'
const PATH = '/articles/how-often-to-review-psychosocial-controls'

const GAP_CHECK = '/gap-check?utm_source=article&utm_medium=seo&utm_campaign=articles&utm_content=review'

export function ArticleReview() {
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
      headline: 'Psychosocial hazards at work: four examples and the controls that fit them',
      description: DESCRIPTION,
      dateModified: '2026-11-12',
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
            <CalendarClock size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">How often should you review psychosocial controls?</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 13 November 2026. General information only, not legal advice.
        </p>

        <Card className="mt-6 border-accent/30 bg-accent/5">
          <p className="text-sm text-muted">
            <strong className="text-ink">Rules differ by jurisdiction.</strong> Each state and territory has its own WHS regulator, and each regulator publishes its own codes of practice and regulations. Most are based on the Safe Work Australia model code, but they are not identical, and Victoria and Western Australia run their own frameworks. This article uses the model code as a common reference. Always check the code and regulations that apply where you operate. Our{' '}
            <Link to="/guides" className="text-accent hover:underline">state and territory guides</Link> link to each regulator’s material.
          </p>
        </Card>

        
        
        <p className="mt-6 text-lg text-muted">
          The short answer is that the model code doesn’t give a number. It says control measures should be reviewed “regularly”, and it lists the situations where a review is required. That leaves you to set the schedule yourself, and to be able to show why you chose it. Here is how to do that.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What the code requires</h2>
        <p className="mt-3 text-muted">
          The code treats review as the last step of the risk management process: check that the controls work as planned, and if one isn’t working effectively, it must be reviewed and modified or replaced. It says a review is required:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li>when a control isn’t eliminating or minimising the risk as far as is reasonably practicable</li>
          <li>before a workplace change likely to create a new or different risk that the control may not handle</li>
          <li>when a new hazard or risk is identified</li>
          <li>when the results of consultation indicate a review is needed</li>
          <li>when a health and safety representative reasonably asks for one, believing one of those situations has occurred and hasn’t been adequately reviewed</li>
        </ul>
        <p className="mt-3 text-muted">
          It also says reports, complaints and grievances from workers, including informal ones, should prompt a look at whether your controls and your response processes are working.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Two kinds of review</h2>
        <p className="mt-3 text-muted">
          The list above gives you event-driven reviews, which happen when something changes. The word “regularly” gives you scheduled reviews, which happen whether or not anything has gone wrong. You need both. Event reviews catch problems as they arise. Scheduled reviews catch the slow drift that nobody reports.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Setting a schedule</h2>
        <p className="mt-3 text-muted">
          The code doesn’t set intervals, so the following is our practical suggestion, not a requirement. Base the cycle on how serious the hazard is and how new the control is.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li><strong className="text-ink">New controls:</strong> check in within the first weeks, once workers have had time to adjust, then again after a few months.</li>
          <li><strong className="text-ink">Higher-risk hazards,</strong> such as aggression, trauma exposure or sustained high demands: review more often, for example every few months.</li>
          <li><strong className="text-ink">Stable, lower-risk hazards:</strong> at least once a year.</li>
        </ul>
        <p className="mt-3 text-muted">
          Whatever you choose, write it into the register as a review date for each control, with a named owner. Some regulators or your own sector may expect something more specific, so check the code and regulations that apply to you.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What a review looks like</h2>
        <p className="mt-3 text-muted">
          The code says to use the same methods as when you first identified the hazard: inspecting the workplace, consulting workers and their representatives, and analysing records and data. It also says the person doing the review should have the authority and resources to do it properly, and to recommend changes. The questions it suggests include:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li>Are the controls working, without creating new risks?</li>
          <li>Have workers reported feeling stressed, or are they showing signs of harm?</li>
          <li>Have all the hazards been identified, and have the risks changed?</li>
          <li>Are workers involved, and are they raising concerns openly?</li>
          <li>Are there upcoming changes that could expose workers to new hazards?</li>
          <li>Are there better controls available now?</li>
        </ul>
        <p className="mt-3 text-muted">
          If the effectiveness of a control is in doubt, the code says to go back through the earlier steps and make new decisions.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What to record</h2>
        <p className="mt-3 text-muted">
          For each review, note the date, who carried it out, who was consulted, what you looked at, what you found, what changed, and the next review date. A review that finds nothing wrong is still worth recording, because it shows the control was checked. We cover how to structure the register in{' '}
          <Link to="/articles/psychosocial-risk-register" className="text-accent hover:underline">What a psychosocial risk register should contain</Link>.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Common mistakes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li>Treating the date of the last assessment as the date of the last review.</li>
          <li>Reviewing only after an incident. That’s reactive, and it misses slow drift.</li>
          <li>Letting the reviewer be someone with no authority to change anything.</li>
          <li>Skipping the consultation step. The code says you must consult workers and their representatives.</li>
          <li>Forgetting the change triggers: a restructure, a new system, a new site or a busy season can all create new risks.</li>
        </ul>
        <p className="mt-3 text-muted">
          Humanora is a psychosocial risk management system. You can set how often your organisation reassesses, and it shows when reviews are due, alongside your hazards, controls and owners. You can also see where your own evidence is thin with our free two-minute Gap Check.
        </p>

        <Card className="mt-8 border-accent/30 bg-accent/5">
          <h3 className="font-serif text-lg text-ink">Check where your evidence is thin</h3>
          <p className="mt-1 text-sm text-muted">
            Our free two-minute Gap Check asks six questions and shows the legislation for your state. No login needed.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => navigate(GAP_CHECK)} className="px-5 py-2.5">
              Run the free Gap Check <ArrowRight size={16} />
            </Button>
          </div>
        </Card>

                        <div className="mt-12 border-t border-border pt-6">
          <h2 className="font-serif text-xl text-ink">Sources</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-muted">
            <li>Safe Work Australia: Model Code of Practice, Managing psychosocial hazards at work (July 2022), sections on reviewing control measures and recording the process</li>
          </ul>
        </div>
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
