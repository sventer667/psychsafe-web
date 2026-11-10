import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Scale } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public state guide: ACT. Written from WorkSafe ACT's published pages and the
// Managing Psychosocial Hazards at Work Code of Practice (NI2023-482). Sets its own page
// title, description and FAQ structured data while mounted (the app is a
// single-page app, so there is no per-route <head> to edit).

const TITLE = 'Psychosocial Hazards ACT: Employer Guide | Humanora'
const DESCRIPTION =
  'What ACT employers must do under WHS law to manage psychosocial hazards: identify, control, consult, review, and keep a record.'
const PATH = '/guides/act-psychosocial-hazards'

const GAP_CHECK = '/gap-check?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=act'
const SIGNUP = '/signup?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=act'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'When did the ACT’s psychosocial risk rules start?',
    a: 'On 27 November 2023, when the code of practice took effect and the Work Health and Safety Regulation 2011 changes came into force.',
  },
  {
    q: 'Does the ACT use the hierarchy of controls for psychosocial hazards?',
    a: 'Yes. WorkSafe ACT says PCBUs must implement controls according to the hierarchy: eliminate, then minimise using substitution, isolation and engineering, then administrative controls, then PPE.',
  },
  {
    q: 'Do I have to report a sexual assault at work?',
    a: 'Yes. Since 9 June 2023, PCBUs must notify WorkSafe ACT as soon as they become aware of a sexual assault incident in their workplace.',
  },
  {
    q: 'Must I keep written records?',
    a: 'The code says you should. Records are how you show you met your duties, and an inspector may ask to see them.',
  },
  {
    q: 'Who can I contact at WorkSafe ACT?',
    a: 'WorkSafe ACT’s number is 13 22 81 (Monday to Friday 8:30am to 4:30pm, weekends and public holidays 9:00am to 4:30pm). You can also use its online form to report a workplace concern.',
  },
]

export function GuideACT() {
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
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Psychosocial hazards in the ACT: what employers must do</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 10 November 2026. General information only, not legal advice. Always check the current
          legislation and WorkSafe ACT guidance.
        </p>

        <p className="mt-6 text-lg text-muted">
          Since <strong className="text-ink">27 November 2023</strong>, the ACT has had specific rules for managing psychosocial hazards at work. New provisions were added to the Work Health and Safety Regulation 2011, and the Managing Psychosocial Hazards at Work Code of Practice was approved under the Work Health and Safety Act 2011. WorkSafe ACT, the regulator, has a dedicated team of psychosocial inspectors.
        </p>
        <p className="mt-4 text-muted">
          This guide sets out what the rules ask of you and what a defensible record looks like.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What is a psychosocial hazard?</h2>
        <p className="mt-3 text-muted">
          WorkSafe ACT describes psychosocial hazards as factors in the design or management of work, or harmful workplace behaviours, that can cause physical and psychological harm. Its examples include job demands, low job control, poor support, lack of role clarity, poor change management, inadequate reward or recognition, poor organisational justice, remote or isolated work, a poor physical environment, conflict or poor workplace relationships, and traumatic events or material. They also include harmful behaviours such as violence and aggression, bullying, sexual harassment and sexual assault.
        </p>
        <p className="mt-3 text-muted">
          WorkSafe also points out that many psychosocial hazards are ongoing and less obvious than one-off incidents. Because they happen daily, they are often treated as cultural or industry norms. Stress is not in itself an injury, but if it is excessive or prolonged it may lead to psychological or physical injury.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">How the ACT fits with the rest of Australia</h2>
        <p className="mt-3 text-muted">
          The ACT uses the model Work Health and Safety laws, which most states and territories share. The ACT code is based on Safe Work Australia’s model code, with material from WorkSafe Queensland, adapted for the ACT. Victoria is the main exception, with its own standalone regulations, so guidance written for Victoria does not always carry over.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What the rules ask of you</h2>
        <p className="mt-3 text-muted">
          A business (a “PCBU”) must manage psychosocial risks under the WHS Regulation. In practice that means:
        </p>
        <div className="mt-4 space-y-3">
          <Card>
            <h3 className="font-serif text-lg text-ink">1. Identify reasonably foreseeable hazards</h3>
            <p className="mt-1 text-sm text-muted">
              Find the hazards that could give rise to psychosocial risks in your workplace.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">2. Eliminate the risks</h3>
            <p className="mt-1 text-sm text-muted">
              Eliminate the risks so far as is reasonably practicable.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">3. If you cannot eliminate them, minimise them</h3>
            <p className="mt-1 text-sm text-muted">
              Minimise the risks so far as is reasonably practicable, and maintain your controls so they stay effective.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">4. Review, and revise if needed</h3>
            <p className="mt-1 text-sm text-muted">
              The code says review is required when a control is not working, before a workplace change likely to create a new or different risk, when a new hazard or risk is identified, when consultation indicates it is needed, or when a health and safety representative asks for one.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">Consult throughout</h3>
            <p className="mt-1 text-sm text-muted">
              You must consult workers, and any health and safety representatives, when assessing risks and deciding on controls.
            </p>
          </Card>
        </div>
        <h2 className="mt-10 font-serif text-2xl text-ink">The hierarchy of controls applies</h2>
        <p className="mt-3 text-muted">
          The ACT kept the hierarchy of controls for psychosocial hazards. WorkSafe ACT says PCBUs need to implement controls in this order:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted">
          <li>eliminate the hazard</li>
          <li>minimise the risk using substitution, isolation and engineering controls</li>
          <li>use administrative controls</li>
          <li>use personal protective equipment</li>
        </ul>
        <p className="mt-3 text-muted">
          WorkSafe says that failing to meet these requirements may lead to regulatory action. The code adds that controls should mostly be set at the level of work and system design, not at the level of individual resilience, so the risk is addressed at its source. It also lists the matters you must consider when choosing controls, including how long, how often and how severely workers are exposed, how hazards interact, the design of work, systems of work, the workplace environment, workplace interactions and behaviours, and the information, training, instruction and supervision provided.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Sexual assault must be notified</h2>
        <p className="mt-3 text-muted">
          From 9 June 2023, PCBUs in the ACT must notify WorkSafe ACT as soon as they become aware of a sexual assault incident in their workplace.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Officers have a duty too</h2>
        <p className="mt-3 text-muted">
          Officers, such as company directors, must exercise due diligence to make sure the business meets its duties. WorkSafe ACT says this includes taking reasonable steps to understand the psychosocial hazards in the business’s operations and making sure it has and uses appropriate resources and processes to eliminate or minimise the risks.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Is the code of practice mandatory?</h2>
        <p className="mt-3 text-muted">
          The code is an approved code of practice under section 274 of the WHS Act. It is practical guidance on meeting duties rather than a separate law. You may meet your duties another way if it provides an equivalent or higher standard of safety, but following the code is the most direct way to show you took reasonable steps.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What a good record looks like</h2>
        <p className="mt-3 text-muted">
          The code says PCBUs should record the risk management process and its outcomes, including consultation with
          workers, so they can show they met their duties. It also says a WHS inspector may ask to see these records,
          and that without a written record you will need to show by other means how you met your duties. A strong
          record is dated and specific:
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
              <a className="text-accent hover:underline" href="https://www.worksafe.act.gov.au/health-and-safety-portal/safety-topics/psychosocial-hazards" target="_blank" rel="noopener noreferrer">
                WorkSafe ACT: Psychosocial hazards
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.worksafe.act.gov.au/about-worksafe-act/news-and-media/new-managing-psychosocial-risks-at-work-code-of-practice" target="_blank" rel="noopener noreferrer">
                WorkSafe ACT: New Managing Psychosocial Risks at work Code of Practice
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://legislation.act.gov.au/DownloadFile/ni/2023-482/current/PDF/2023-482.PDF" target="_blank" rel="noopener noreferrer">
                ACT Legislation Register: Work Health and Safety (Managing Psychosocial Hazards at Work Code of Practice) Approval 2023, NI2023-482
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
