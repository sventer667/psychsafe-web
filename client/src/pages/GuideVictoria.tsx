import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Scale } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public state guide: Victoria. Written from WorkSafe Victoria's published
// regulations FAQ and Psychological Health Compliance Code. Sets its own page
// title, description and FAQ structured data while mounted (the app is a
// single-page app, so there is no per-route <head> to edit).

const TITLE = 'Psychosocial Hazards Victoria: Employer Guide | Humanora'
const DESCRIPTION =
  'What Victorian employers must do under the Psychological Health Regulations 2025: identify hazards, control risks, consult, review, and keep a record.'
const PATH = '/guides/victoria-psychosocial-hazards'

const GAP_CHECK = '/gap-check?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=vic'
const SIGNUP = '/signup?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=vic'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'When did Victoria’s psychological health regulations start?',
    a: 'On 1 December 2025.',
  },
  {
    q: 'Are they part of the main OHS Regulations?',
    a: 'No. The Victorian Government made them standalone regulations, to be reviewed after five years.',
  },
  {
    q: 'Do the regulations change workers’ compensation eligibility?',
    a: 'No. WorkSafe says eligibility for workers compensation is governed by a separate Act, and the regulations do not affect it.',
  },
  {
    q: 'Do employees have duties too?',
    a: 'Yes. While at work, employees must take reasonable care for their own health and safety and that of others, and cooperate with the employer’s actions to comply.',
  },
  {
    q: 'Does a small business have to follow the same rules?',
    a: 'The duties apply to all employers. WorkSafe runs a free online session, Psychological Health Basics, for small and medium businesses.',
  },
]

export function GuideVictoria() {
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
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Psychosocial hazards in Victoria: what employers must do</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 9 November 2026. General information only, not legal advice. Always check the current
          regulations and WorkSafe Victoria guidance.
        </p>

        <p className="mt-6 text-lg text-muted">
          Since <strong className="text-ink">1 December 2025</strong>, Victorian employers have had specific duties to
          manage psychosocial hazards. These duties sit in the Occupational Health and Safety (Psychological Health)
          Regulations 2025, which work alongside the Occupational Health and Safety Act 2004. WorkSafe Victoria has
          also published a Psychological Health Compliance Code that explains how to meet them.
        </p>
        <p className="mt-4 text-muted">
          This guide sets out what the rules ask of you and what a defensible record looks like.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What is a psychosocial hazard?</h2>
        <p className="mt-3 text-muted">
          A psychosocial hazard is anything in how work is designed, organised, managed or carried out, or in how people
          interact at work, that could cause a negative psychological response and so create a risk to someone’s health
          or safety. WorkSafe’s compliance code gives 16 worked examples, including high job demands, low job control,
          bullying, sexual harassment and gendered violence, and aggression or violence.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Victoria’s rules are different from the rest of Australia</h2>
        <p className="mt-3 text-muted">
          Victoria is not part of the model Work Health and Safety laws used in most other states and territories. Its
          psychosocial rules are a <strong className="text-ink">standalone</strong> set of regulations rather than a
          section added to the main OHS Regulations. So guidance written for NSW or Queensland does not always carry
          over. The control-of-risk wording in particular differs (see below).
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">The four things you must do</h2>
        <div className="mt-4 space-y-3">
          <Card>
            <h3 className="font-serif text-lg text-ink">1. Identify psychosocial hazards</h3>
            <p className="mt-1 text-sm text-muted">
              Look at how work is designed and managed in your workplace and find the hazards that could harm
              psychological health.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">2. Control the risks</h3>
            <p className="mt-1 text-sm text-muted">
              The first question is whether you can eliminate the risk so far as is reasonably practicable. If you
              cannot, you must reduce it so far as is reasonably practicable. Victoria’s rules list how: change the
              management of work, the plant, the systems of work, the work design or the workplace environment; or use
              information, instruction or training; or a combination of these. Information, instruction and training
              can be the only control only when nothing else is reasonably practicable, and it must not be the main
              control when you use a combination.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">3. Review and revise your controls</h3>
            <p className="mt-1 text-sm text-muted">
              You must go back over your controls when the level of risk may have changed. The triggers include: new
              information about a hazard; a report of a psychological injury or hazard from an employee or someone
              acting for them; after a notifiable incident involving a psychosocial hazard; before a change to
              something, a process or a system of work that is likely to change the risks; and after a health and safety
              representative asks for a review.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">4. Consult</h3>
            <p className="mt-1 text-sm text-muted">
              So far as is reasonably practicable, you must consult employees about health and safety matters that
              affect them. Where a health and safety representative represents them, the consultation must involve that
              representative. The duty also covers independent contractors you engage, for matters you control.
            </p>
          </Card>
        </div>

        <h2 className="mt-10 font-serif text-2xl text-ink">What about a prevention plan?</h2>
        <p className="mt-3 text-muted">
          A written prevention plan is not mandatory, but WorkSafe Victoria encourages employers to use its template to
          guide the process.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Does following the Compliance Code help?</h2>
        <p className="mt-3 text-muted">
          Yes. An employer who complies with the Psychological Health Compliance Code is taken to have complied with
          the duties it covers under the OHS Act and the Psychological Health Regulations.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">How is it enforced?</h2>
        <p className="mt-3 text-muted">
          WorkSafe has said that employers must meet all obligations from commencement, and that it does not expect
          major changes to its enforcement approach. Inspectors will take into account that businesses start from
          different points and may need time to adjust.
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
          <li>when and how you consulted employees and health and safety representatives</li>
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
              <a className="text-accent hover:underline" href="https://www.worksafe.vic.gov.au/psychological-health-regulations-frequently-asked-questions" target="_blank" rel="noopener noreferrer">
                WorkSafe Victoria: Psychological health regulations, frequently asked questions
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.worksafe.vic.gov.au/compliance-code-psychological-health" target="_blank" rel="noopener noreferrer">
                WorkSafe Victoria: Compliance code, Psychological health
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.worksafe.vic.gov.au/psychological-health" target="_blank" rel="noopener noreferrer">
                WorkSafe Victoria: Psychological health toolkit
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
