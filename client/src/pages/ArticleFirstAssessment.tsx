import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Compass } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public article: your first assessment in Humanora. Brand-only, no byline.
// Sets its own page title, description, canonical link and Article structured data while
// mounted (the app is a single-page app, so there is no per-route <head> to edit).

const TITLE = 'Your First Psychosocial Risk Assessment in Humanora | Humanora'
const DESCRIPTION =
  'A walk through your first psychosocial risk assessment in Humanora, from setting your state to a sealed report, with screenshots.'
const PATH = '/articles/first-psychosocial-risk-assessment-humanora'

const SIGNUP = '/signup?utm_source=article&utm_medium=seo&utm_campaign=articles&utm_content=first-assessment'

function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="mt-5">
      <img src={src} alt={alt} width={1200} height={499} loading="lazy" className="w-full rounded-xl border border-border" />
    </figure>
  )
}

export function ArticleFirstAssessment() {
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
      headline: 'Your first psychosocial risk assessment in Humanora',
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
            <Compass size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Your first psychosocial risk assessment in Humanora</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 27 November 2026. General information only, not legal advice.
        </p>

        <p className="mt-6 text-lg text-muted">
          When you log in to Humanora for the first time, the dashboard shows a short Getting started list. Six steps, each one ticked off as you do it.
        </p>
        <Shot src="/screens/01-getting-started.jpg" alt="The Getting started list on the Humanora dashboard, with 0 of 6 steps done" />
        <p className="mt-4 text-muted">
          We’ll go through those six steps in order, using a sample assessment we set up for this article. The scenario is made up and the names in the screenshots are blurred. Nothing here is a real customer.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">1. Set your state or territory</h2>
        <p className="mt-3 text-muted">
          Open Subscription and fill in your organisation profile. Industry and state are the two fields that matter. The state you pick here pre-fills every new assessment, so the right legislation turns up without you hunting for it.
        </p>
        <Shot src="/screens/02-organisation-profile.jpg" alt="The organisation profile, with industry set to Logistics / Warehousing and state set to VIC" />
        <p className="mt-4 text-muted">
          If you have sites in more than one state, you can change the state on an individual assessment (it’s on the Overview tab). That per-assessment setting is the one that decides which legislation gets cited in the Risk Register and the PDF report.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">2. Create an assessment</h2>
        <p className="mt-3 text-muted">
          Go to Assessments, click New Assessment, give it a name and check the state. Use one assessment per site, team or review period. We called ours “Dispatch team 2026 (sample)”.
        </p>
        <p className="mt-3 text-muted">
          Every assessment has the same five tabs: Risk Register, Action Items, Consultation Log, Report and Overview. You work through them left to right, and each tab has a Next button at the bottom.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">3. Add a hazard from the library</h2>
        <p className="mt-3 text-muted">
          The Risk Register starts empty, but you don’t have to write hazards from scratch. There’s a built-in library grouped by theme, and each hazard comes with the legislation for your state and a set of suggested controls.
        </p>
        <Shot src="/screens/03-hazard-library.jpg" alt="The hazard library, grouped by theme, with Fatigue listed under Job design" />
        <p className="mt-4 text-muted">
          We picked Fatigue (it’s under Job design). Humanora asks how likely it is and how serious the impact would be, and each answer comes with a one-line description, like “might happen at some point, there’s a real chance it does”. You don’t need a risk background to choose.
        </p>
        <p className="mt-3 text-muted">
          After that you can add the detail that makes the rating something you can defend. What told you it’s a risk here? When are workers exposed? Who’s affected? In our example, a dispatcher told their supervisor that back-to-back late shifts had left them exhausted, so that went in as the evidence. The hazard now sits in the register with a current risk score (ours shows 9). You can also attach incident reports or survey results as separate evidence items, and log the controls you already have, with a rating of how well each one works.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">4. Look at the recommended controls</h2>
        <p className="mt-3 text-muted">
          Open the hazard and scroll down and you’ll find a list of recommended actions, most effective first: eliminate, substitute, isolate, engineering or system controls, administrative controls, then individual support.
        </p>
        <Shot src="/screens/04-recommended-controls.jpg" alt="Recommended actions for Fatigue, listed from Eliminate through to Individual support, with one already added to the action items" />
        <p className="mt-4 text-muted">
          These are suggestions, and you choose what fits your workplace. The order is the useful part. Under the Victorian rules, information, instruction and training can’t be the main control where something better is reasonably practicable. So when “redesign rosters” is sitting at the top of the list and “fatigue-awareness training” is at the bottom, it’s hard to fall into the trap of reaching for a training session first.
        </p>
        <p className="mt-3 text-muted">
          Each suggestion has an “Add to action items” link next to it. One click and it becomes an action. Further down the same panel you’ll see the legislation that applies (for us, the Occupational Health and Safety Act 2004 and the Psychological Health Regulations 2025) and a note about residual risk. You can only re-rate residual risk once a linked action is marked complete, which stops anyone from scoring a control that only exists on paper.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">5. Give every action an owner and a date</h2>
        <p className="mt-3 text-muted">
          Over on Action Items, an action has a title, an optional description, an owner, a due date and an optional linked hazard. The owner comes from a list of your team. You can’t type in a name, which is deliberate: someone has to be a real person in the account to be held to a date.
        </p>
        <Shot src="/screens/05-action-owner-due-date.jpg" alt="The new action form, with title, description, owner, due date and linked hazard" />
        <p className="mt-4 text-muted">
          Actions move through Not started, Underway, Awaiting sign-off, Done and Closed out. The dashboard counts open and overdue actions, and the app shows a banner when something’s overdue.
        </p>
        <Shot src="/screens/06-action-list.jpg" alt="The action list, with two actions, their owners, a due date and a status" />

        <h2 className="mt-10 font-serif text-2xl text-ink">6. Record the consultation</h2>
        <p className="mt-3 text-muted">
          Consultation is a legal requirement, so there’s a tab for it. Log the date, the method, who was there and a summary.
        </p>
        <Shot src="/screens/07-consultation-log.jpg" alt="The Consultation Log with one record, a dispatch team meeting, who attended and what was discussed" />
        <p className="mt-4 text-muted">
          Spend a little time on the summary. “Team meeting held” doesn’t tell anyone much. “Dispatchers said one roster pattern would make childcare impossible, so we changed it” does, and it’s what you’ll want when someone asks what the consultation achieved.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">7. Export the report</h2>
        <p className="mt-3 text-muted">
          The Report tab gives you one PDF: the hazard register, a breakdown by risk level, the action items ordered by how overdue they are, the consultation log, and the obligations for your state. The preparer’s name and credential go on the cover.
        </p>
        <Shot src="/screens/08-report.jpg" alt="The Report tab with a Download PDF report button" />

        <h2 className="mt-10 font-serif text-2xl text-ink">8. Close and seal</h2>
        <p className="mt-3 text-muted">
          The last job is on the Overview tab. Closing an assessment locks every hazard, action and consultation entry, creates a hash of the contents and has an independent timestamp authority (RFC 3161) stamp it. Later on, anyone can check what the record held and when it was closed. A sealed assessment can’t be edited. If something changes you can reopen it, but you have to give a reason, and the reason is kept.
        </p>
        <Shot src="/screens/09-close-and-seal.jpg" alt="The Close and seal this assessment panel on the Overview tab" />
        <p className="mt-4 text-muted">We didn’t seal ours, since it’s only a sample.</p>
        <p className="mt-3 text-muted">
          Back on the dashboard, the Getting started list keeps count. In our example the only thing left is inviting a teammate.
        </p>
        <Shot src="/screens/10-getting-started-progress.jpg" alt="The Getting started list showing 5 of 6 steps done" />

        <h2 className="mt-10 font-serif text-2xl text-ink">Try it on one real hazard</h2>
        <p className="mt-3 text-muted">
          If you want to know whether this suits your workplace, the quickest test is one real hazard run through the whole process. You can start a free 7-day trial for that. Or take the three-minute{' '}
          <Link to="/gap-check" className="text-accent hover:underline">Gap Check</Link> first to see where your records stand. If you’re in Victoria, our{' '}
          <Link to="/guides/victoria-psychosocial-hazards" className="text-accent hover:underline">Victoria employer guide</Link> and the article on{' '}
          <Link to="/articles/victoria-psychological-health-regulations-checklist" className="text-accent hover:underline">what to do and what to keep</Link> cover the rules behind all this.
        </p>

        <Card className="mt-8 border-accent/30 bg-accent/5">
          <h3 className="font-serif text-lg text-ink">Start a free 7-day trial</h3>
          <p className="mt-1 text-sm text-muted">
            Run one real hazard through an assessment and see how it feels.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => navigate(SIGNUP)} className="px-5 py-2.5">
              Start free trial <ArrowRight size={16} />
            </Button>
          </div>
        </Card>

        <p className="mt-6 text-sm italic text-muted">
          This article is general information, not legal advice, and Humanora doesn’t decide what’s reasonably practicable for your workplace. The example and screenshots come from a made-up sample assessment. Check the current regulations and your regulator’s guidance, and take advice for your situation.
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
