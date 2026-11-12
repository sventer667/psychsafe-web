import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public article: what a psychosocial risk register should contain. Brand-only, no byline.
// Sets its own page title, description, canonical link and Article structured data while
// mounted (the app is a single-page app, so there is no per-route <head> to edit).

const TITLE = 'What a Psychosocial Risk Register Should Contain | Humanora'
const DESCRIPTION =
  'What to put in a psychosocial risk register, column by column, with a short worked entry and the mistakes that make a register useless in a review.'
const PATH = '/articles/psychosocial-risk-register'

const GAP_CHECK = '/gap-check?utm_source=article&utm_medium=seo&utm_campaign=articles&utm_content=register'

export function ArticleRiskRegister() {
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
      headline: 'What a psychosocial risk register should contain',
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
            <FileText size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">What a psychosocial risk register should contain</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 12 November 2026. General information only, not legal advice.
        </p>

        <Card className="mt-6 border-accent/30 bg-accent/5">
          <p className="text-sm text-muted">
            <strong className="text-ink">Rules differ by jurisdiction.</strong> Each state and territory has its own WHS regulator, and each regulator publishes its own codes of practice and regulations. Most are based on the Safe Work Australia model code, but they are not identical, and Victoria and Western Australia run their own frameworks. Always check the code and regulations that apply where you operate. Our{' '}
            <Link to="/guides" className="text-accent hover:underline">state and territory guides</Link> link to each regulator’s material.
          </p>
        </Card>

        <p className="mt-6 text-lg text-muted">
          Ask ten workplaces for their psychosocial risk register and you’ll get ten different things. A spreadsheet with a tab nobody has opened since March. A policy document with “register” in the filename. A folder of survey results. This article sets out what a register needs to hold so that it’s useful on a normal Tuesday, and still holds up when someone asks to see it.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Why the record matters</h2>
        <p className="mt-3 text-muted">
          Codes of practice generally say to record how you managed psychosocial risk, but check your own regulator’s wording. Two reasons come up again and again. It lets you show what you did to meet your duties, and it gives you something to look at when you review your controls next time. The codes also note that an inspector may ask to see these records. If the work happened but the only evidence is in people’s heads and inboxes, you’ve lost most of the benefit.
        </p>
        <p className="mt-3 text-muted">
          No law prescribes one format. The regulators publish example registers, and they are good starting points. SafeWork NSW’s code has one, and so does Queensland’s. They differ in layout but cover the same ground.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">The columns that matter</h2>
        <p className="mt-3 text-muted">Here is what a register needs, and why each column is there.</p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Date raised.</em> When you first became aware of the issue. It sounds trivial, but “when did you know?” is a question you’ll be asked.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">The hazard or situation.</em> Say what it is, specifically. “Stress” tells you nothing. “Unrealistic deadlines in month-end reporting for the accounts team” tells you where to look.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Where the information came from.</em> Complaints, incident reports, a comment in a team meeting, sick leave patterns, a walkaround, a worker’s compensation claim. If you can’t say how you know about a hazard, it’s hard to defend the rating you gave it.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Harm and likelihood.</em> What could happen, how badly, and how likely it is. Pick a rating method and use it every time, so entries can be compared.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Level of risk.</em> The result of the two above. This is what lets you decide what to deal with first.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Controls already in place, and how well they work.</em> People skip the second half. Listing a training course tells the reader what you did. Saying whether it works tells them whether the risk has changed.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Further controls required.</em> This is where the hierarchy of controls comes in. Look at the work itself first: workload, scheduling, role clarity, staffing. Training and awareness sessions are the weakest controls, since they depend on individuals changing their behaviour. The codes say this directly: controls should mostly sit at the level of work and system design, not individual resilience.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Who is responsible, and by when.</em> One name and one date for each action. Shared ownership usually means no ownership.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">How it will be monitored, and the review date.</em> A register with no review dates is a snapshot, not a record. This is the column most registers are missing.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">A short worked entry (illustration only)</h2>
        <p className="mt-3 text-muted">Picture a 40-person finance team at an organisation with a monthly close.</p>
        <Card className="mt-4">
          <ul className="space-y-1.5 text-sm text-muted">
            <li><strong className="text-ink">Date raised:</strong> 3 March</li>
            <li><strong className="text-ink">Hazard:</strong> Sustained high demands in the month-end close, with overtime most months</li>
            <li><strong className="text-ink">Sources:</strong> Overtime records, two comments in the team meeting, a rise in sick leave in the first week of each month</li>
            <li><strong className="text-ink">Harm and likelihood:</strong> Moderate harm, likely</li>
            <li><strong className="text-ink">Risk level:</strong> High</li>
            <li><strong className="text-ink">Controls in place:</strong> None formal. The manager asks people to “manage their time”</li>
            <li><strong className="text-ink">How well they work:</strong> Not effective</li>
            <li><strong className="text-ink">Further controls:</strong> Stagger deadlines across the month, add temporary cover for close week, review which reports are still needed</li>
            <li><strong className="text-ink">Owner and due date:</strong> Finance manager, 30 April</li>
            <li><strong className="text-ink">Monitoring:</strong> Check overtime and sick leave after the next two closes</li>
            <li><strong className="text-ink">Review date:</strong> 30 June</li>
          </ul>
        </Card>
        <p className="mt-4 text-muted">
          Everything an inspector or a board member would want to ask is on one line.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Mistakes that make a register useless</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li><strong className="text-ink">Vague hazards.</strong> If the entry could apply to any workplace, it isn’t recording anything about yours.</li>
          <li><strong className="text-ink">No evidence of consultation.</strong> Note who was asked, when, and what they said. The codes expect consultation at each step.</li>
          <li><strong className="text-ink">Controls with no owner or date.</strong> An action nobody owns won’t happen.</li>
          <li><strong className="text-ink">Never reviewed.</strong> Set the review date when you create the entry, and look at it when it arrives.</li>
          <li><strong className="text-ink">Records spread across email, minutes and memory.</strong> Pull them into one place.</li>
        </ul>

        <h2 className="mt-10 font-serif text-2xl text-ink">Keeping it in practice</h2>
        <p className="mt-3 text-muted">
          Whatever tool you use, the test is simple: could someone who wasn’t involved read the entry and understand what you found, what you did and when you’ll check again? If so, you have a record.
        </p>
        <p className="mt-3 text-muted">
          Humanora is a psychosocial risk management system built around this structure: hazards from a library, ratings, actions with owners and due dates, consultation logs, and an export that records the history. You can also see where your own evidence is thin with our free two-minute Gap Check.
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

        <p className="mt-6 text-muted">
          For what employers must do in your jurisdiction, see our{' '}
          <Link to="/guides" className="text-accent hover:underline">state and territory guides</Link>.
        </p>

        <div className="mt-12 border-t border-border pt-6">
          <h2 className="font-serif text-xl text-ink">Sources</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-muted">
            <li>SafeWork NSW: Managing psychosocial hazards at work, Code of Practice, Appendix B, example risk register</li>
            <li>WorkSafe Queensland: Managing the risk of psychosocial hazards at work, Code of Practice 2022</li>
            <li>Colin Biggers &amp; Paisley: Recording the risk management process for psychosocial hazards (6 March 2023)</li>
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
