import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Scale } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public state guide: New South Wales. Written from SafeWork NSW's published
// psychological health and safety pages and the WHS Act 2011. Sets its own page
// title, description and FAQ structured data while mounted (the app is a
// single-page app, so there is no per-route <head> to edit).

const TITLE = 'Psychosocial Hazards NSW: Employer Guide | Humanora'
const DESCRIPTION =
  'What NSW employers must do under WHS law to manage psychosocial hazards: identify, assess, control, consult, review, and keep a record.'
const PATH = '/guides/nsw-psychosocial-hazards'

const GAP_CHECK = '/gap-check?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=nsw'
const SIGNUP = '/signup?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=nsw'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'When did NSW’s psychosocial risk provisions start?',
    a: 'On 1 October 2022, when specific provisions on psychosocial risk were added to the WHS Regulation. The Regulation has since been remade as the Work Health and Safety Regulation 2025.',
  },
  {
    q: 'Does WHS law in NSW cover mental health?',
    a: 'Yes. The WHS Act 2011 defines health as both physical and psychological health.',
  },
  {
    q: 'Who can I call for advice?',
    a: 'SafeWork NSW runs a Psychosocial Advisory Service on 13 10 50 (select 1 for SafeWork NSW, then press 3). Workers can also report a psychosocial hazard through a form on the SafeWork NSW website.',
  },
  {
    q: 'Do workers have duties too?',
    a: 'Yes. Workers must take reasonable care for their own health and safety and that of others, follow reasonable instructions, and report hazards. They should also take part in risk assessments and reviews of controls.',
  },
  {
    q: 'Does a small business have to follow the same rules?',
    a: 'The duties apply to all businesses. SafeWork NSW publishes a fact sheet for small businesses, Preventing psychological harm: first steps.',
  },
]

export function GuideNSW() {
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
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
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
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} /> Back to Humanora
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Scale size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Psychosocial hazards in NSW: what employers must do</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 10 November 2026. General information only, not legal advice. Always check the current
          legislation and SafeWork NSW guidance.
        </p>

        <p className="mt-6 text-lg text-muted">
          In NSW, the Work Health and Safety Act 2011 defines “health” as both physical and psychological health. That
          means a business (a “PCBU” in the Act) must manage the risk of psychological harm in the same way it manages
          the risk of physical harm. The detail sits in the psychosocial risk provisions of the Work Health and Safety
          Regulation 2025, and SafeWork NSW’s code of practice, Managing psychosocial hazards at work, explains how to
          meet them.
        </p>
        <p className="mt-4 text-muted">
          This guide sets out what the rules ask of you and what a defensible record looks like.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Why it matters now</h2>
        <p className="mt-3 text-muted">
          SafeWork NSW reports that psychological injury claims in the state rose from 7,289 in 2021-22 to 13,648 in
          2024-25, an 87% increase. Non-psychological claims rose 9% over the same period.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What is a psychosocial hazard?</h2>
        <p className="mt-3 text-muted">
          A psychosocial hazard is anything in how work is designed, organised, managed or carried out, or in the work
          environment and workplace relationships, that could cause psychological or physical harm. SafeWork NSW gives
          examples such as high work pressure, poor support, role overload and bullying. Stress itself is not an
          injury, but when it becomes regular, excessive and long-lasting it can lead to psychological and physical
          injury.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">How NSW fits with the rest of Australia</h2>
        <p className="mt-3 text-muted">
          NSW uses the model Work Health and Safety laws, which most states and territories share. Psychosocial risk is
          covered by specific provisions in the WHS Regulation, introduced in NSW in October 2022. The Regulation was
          later remade as the Work Health and Safety Regulation 2025. Victoria is the main exception, with its own
          standalone regulations, so guidance written for Victoria does not always carry over.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What SafeWork NSW expects you to do</h2>
        <div className="mt-4 space-y-3">
          <Card>
            <h3 className="font-serif text-lg text-ink">1. Identify psychosocial hazards</h3>
            <p className="mt-1 text-sm text-muted">
              Look at how work is designed and managed in your workplace and find the hazards that could harm
              psychological health.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">2. Assess the risks</h3>
            <p className="mt-1 text-sm text-muted">
              Work out how likely each hazard is to cause harm, and how serious the harm could be.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">3. Put controls in place</h3>
            <p className="mt-1 text-sm text-muted">
              Eliminate the risk so far as is reasonably practicable. If you cannot, reduce it so far as is reasonably
              practicable, using the hierarchy of controls. The Regulation also lists matters to consider when
              choosing controls.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">4. Review and monitor your controls</h3>
            <p className="mt-1 text-sm text-muted">
              Check regularly that controls are working, and revisit them when circumstances change.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">5. Consult your workers</h3>
            <p className="mt-1 text-sm text-muted">
              Involve workers throughout: when identifying hazards, assessing risks and choosing solutions.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">6. Respond to reports</h3>
            <p className="mt-1 text-sm text-muted">
              Act on reports of psychosocial hazards and investigate work-related psychological injuries.
            </p>
          </Card>
        </div>

        <h2 className="mt-10 font-serif text-2xl text-ink">Is the code of practice mandatory?</h2>
        <p className="mt-3 text-muted">
          The code is an approved code of practice under the WHS Act. It is practical guidance on meeting your duties
          rather than a separate law. You can use a different approach, but it must achieve a standard that is equal to
          or better than the code. Following the code is the most direct way to show you took reasonable steps.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What a good record looks like</h2>
        <p className="mt-3 text-muted">
          Rules do not help you in a review or an inspection unless you can show the work behind them. A strong record
          is dated and specific:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted">
          <li>the psychosocial hazards you identified, rated and written down</li>
          <li>what told you each was a risk, and when</li>
          <li>the controls you chose, who owns each one, and the due date</li>
          <li>when and how you consulted workers and health and safety representatives</li>
          <li>when each control was last reviewed, and why</li>
        </ul>
        <p className="mt-3 text-muted">
          If that information is spread across emails and memory, it is not yet a record.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Where Humanora fits</h2>
        <p className="mt-3 text-muted">
          Humanora helps you keep this record in one place: pick hazards from a library, rate them, assign actions with
          owners and due dates, log consultation, and export a PDF. Closing an assessment seals it with a
          tamper-evident hash, so a later change leaves a trail. Humanora is a record-keeping tool. It does not replace
          professional advice, and using it does not by itself mean you comply.
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
            <Button variant="secondary" onClick={() => navigate(SIGNUP)} className="px-5 py-2.5">
              Start a 7-day free trial
            </Button>
          </div>
        </Card>

        <h2 className="mt-12 font-serif text-2xl text-ink">Frequently asked questions</h2>
        <div className="mt-4 space-y-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3 className="font-serif text-base text-ink">{f.q}</h3>
              <p className="mt-1 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <h2 className="font-serif text-lg text-ink">Sources</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <a className="text-accent hover:underline" href="https://www.safework.nsw.gov.au/resource-library/psychosocial/psychological-health-and-safety" target="_blank" rel="noopener noreferrer">
                SafeWork NSW: Psychological health and safety
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.safework.nsw.gov.au/resource-library/codes-of-practice/codes-of-practice/managing-psychosocial-hazards-at-work" target="_blank" rel="noopener noreferrer">
                SafeWork NSW: Managing psychosocial hazards at work, Code of Practice
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.safework.nsw.gov.au/hazards-a-z/psychosocial-hazards" target="_blank" rel="noopener noreferrer">
                SafeWork NSW: Psychosocial hazards
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://legislation.nsw.gov.au/view/html/inforce/current/act-2011-010" target="_blank" rel="noopener noreferrer">
                NSW Legislation: Work Health and Safety Act 2011
              </a>
            </li>
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
