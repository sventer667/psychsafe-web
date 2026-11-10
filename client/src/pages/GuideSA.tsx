import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Scale } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public state guide: South Australia. Written from SafeWork SA's Managing Psychosocial Hazards at Work and
// Sexual and Gender-Based Harassment codes of practice (February 2026). Sets its own page
// title, description and FAQ structured data while mounted (the app is a
// single-page app, so there is no per-route <head> to edit).

const TITLE = 'Psychosocial Hazards SA: Employer Guide | Humanora'
const DESCRIPTION =
  'What South Australian employers must do under WHS law to manage psychosocial hazards: identify, control, consult, review, and keep a record.'
const PATH = '/guides/sa-psychosocial-hazards'

const GAP_CHECK = '/gap-check?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=sa'
const SIGNUP = '/signup?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=sa'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'When did South Australia’s psychosocial code of practice start?',
    a: 'On 19 February 2026, the date it was published in the Government Gazette.',
  },
  {
    q: 'Does South Australia use the hierarchy of controls for psychosocial hazards?',
    a: 'Yes. The code says it must be followed if it is not reasonably practicable to eliminate the risk: substitution, isolation and engineering controls, then administrative controls, then PPE.',
  },
  {
    q: 'Does South Australia have a code on sexual harassment?',
    a: 'Yes. The Sexual and Gender-Based Harassment Code of Practice commenced on 19 February 2026, the same day as the psychosocial hazards code, and is meant to be read with it.',
  },
  {
    q: 'Is the code compulsory?',
    a: 'It is an approved code of practice, not a separate law. You may meet your duties another way if it provides an equivalent or higher standard of work health and safety.',
  },
  {
    q: 'Must I keep written records?',
    a: 'The code says you should. Records are how you show you met your duties, and an inspector may ask to see them.',
  },
  {
    q: 'Must I consult my workers?',
    a: 'Yes. You must consult affected workers, including when assessing risks and deciding on controls.',
  },
]

export function GuideSA() {
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
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Psychosocial hazards in South Australia: what employers must do</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 10 November 2026. General information only, not legal advice. Always check the current
          legislation and SafeWork SA guidance.
        </p>

                        <p className="mt-6 text-lg text-muted">
          South Australia uses the model Work Health and Safety laws, and its Work Health and Safety Regulations 2012 include specific provisions on psychosocial risks. SafeWork SA’s code of practice, <em>Managing Psychosocial Hazards at Work</em>, was approved under section 274 of the Work Health and Safety Act 2012 (SA) and commenced on <strong className="text-ink">19 February 2026</strong>, the date it was published in the Government Gazette. It applies to all workplaces covered by the Act.
        </p>
        <p className="mt-4 text-muted">
          This guide sets out what the rules ask of you and what a defensible record looks like.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What is a psychosocial hazard?</h2>
        <p className="mt-3 text-muted">
          The code defines a psychosocial hazard as a hazard that arises from, or relates to, the design or management of work, the working environment, plant at a workplace, or workplace interactions or behaviours, and that may cause psychological harm (whether or not it may also cause physical harm). Hazards and the right controls vary between workplaces and groups of workers, and workers are often exposed to several at once. Some may always be present and others only occasionally.
        </p>
        <p className="mt-3 text-muted">
          The code’s appendices cover job demands, fatigue, low job control, job insecurity, poor support, lack of role clarity, poor change management, inadequate recognition and reward, poor organisational justice, traumatic events or material, remote or isolated work, intrusive surveillance and a poor physical environment, along with harmful behaviours such as bullying, harassment (including sexual harassment) and violence and aggression.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">How South Australia fits with the rest of Australia</h2>
        <p className="mt-3 text-muted">
          The code is based on Safe Work Australia’s model code and was approved in South Australia after the legislated consultation. Most states and territories share the model laws. Victoria is the main exception, with its own standalone regulations, so guidance written for Victoria does not always carry over.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What the rules ask of you</h2>
        <p className="mt-3 text-muted">
          A business (a “PCBU”) manages psychosocial risk through the same four-step risk management process that applies to other hazards, with consultation supporting every step.
        </p>
        <div className="mt-4 space-y-3">
          <Card>
            <h3 className="font-serif text-lg text-ink">1. Identify hazards</h3>
            <p className="mt-1 text-sm text-muted">
              Find out what could cause harm.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">2. Assess risks, if necessary</h3>
            <p className="mt-1 text-sm text-muted">
              Understand the nature of the harm, how serious it could be and how likely it is. The code says this step may not be needed if the risks and controls are already known.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">3. Control risks</h3>
            <p className="mt-1 text-sm text-muted">
              You must eliminate risks if reasonably practicable. If you cannot, you must minimise them so far as is reasonably practicable, and make sure your controls stay effective over time.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">4. Review control measures</h3>
            <p className="mt-1 text-sm text-muted">
              Check they are working as planned and change them as needed.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">Consult throughout</h3>
            <p className="mt-1 text-sm text-muted">
              You must consult workers who are, or are likely to be, directly affected, and consult them when assessing risks and deciding on controls. The code says to involve workers with vulnerabilities. Women, young workers, workers from culturally and linguistically diverse backgrounds, Aboriginal and Torres Strait Islander workers, LGBTQIA+ workers and workers with disability are more likely to experience workplace sexual harassment, so they should have the chance to take part.
            </p>
          </Card>
        </div>
        <h2 className="mt-10 font-serif text-2xl text-ink">The hierarchy of controls applies</h2>
        <p className="mt-3 text-muted">
          The code says the hierarchy of controls must be followed if it is not reasonably practicable to eliminate a psychosocial risk. After elimination, you minimise the risk by:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted">
          <li>substitution, replacing a hazard or hazardous work practice with something that gives rise to a lesser risk</li>
          <li>isolation, separating the hazard from the people exposed</li>
          <li>engineering controls, a physical control measure</li>
        </ul>
        <p className="mt-3 text-muted">
          If risk remains, you apply administrative controls, and any further remaining risk is then minimised with suitable personal protective equipment, so far as is reasonably practicable. The code says administrative controls and PPE do not control the hazard at its source, rely on human behaviour and supervision, and tend to be the least effective on their own.
        </p>
        <p className="mt-3 text-muted">
          It also says controls should mostly be set at the level of organisation, work and system design, not at the level of individual resilience, so the risk is addressed at the source.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">When you must review your controls</h2>
        <p className="mt-3 text-muted">
          The code says controls should be reviewed regularly. A review is also required when a control is not eliminating or minimising the risk so far as is reasonably practicable, before a workplace change likely to create a new or different risk, when a new hazard or risk is identified, when consultation indicates it is needed, or when a health and safety representative reasonably asks for one. It adds that reports, complaints (including informal ones) and grievances should trigger a review of whether your controls and your response procedures are working.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">A second code covers sexual and gender-based harassment</h2>
        <p className="mt-3 text-muted">
          South Australia also has a Sexual and Gender-Based Harassment Code of Practice, approved under the same section of the Act and commenced on the same day, <strong className="text-ink">19 February 2026</strong>. It is meant to be read together with the psychosocial hazards code and uses the same risk management process. It treats sexual and gender-based harassment as a psychosocial hazard that a PCBU must eliminate, or if that is not reasonably practicable, minimise so far as is reasonably practicable. The code says you must consult workers and health and safety representatives at each step, consider how this hazard interacts with other psychosocial hazards, and review controls when they are not working or when a representative reasonably asks.
        </p>
        <p className="mt-3 text-muted">
          The code also points to a separate duty. The Commonwealth Sex Discrimination Act 1984 includes a positive duty to take reasonable and proportionate measures to eliminate, as far as possible, sexual harassment and certain other unlawful conduct in connection with work. It operates alongside WHS duties and is not replaced by them.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Officers have a duty too</h2>
        <p className="mt-3 text-muted">
          Officers, such as department secretaries or company directors, must exercise due diligence to make sure the business meets its duties. For psychosocial risk the code says this means taking reasonable steps to keep up to date with the subject, understand the psychosocial hazards in the business’s operations, make sure the business has and uses appropriate resources and processes, make sure it has processes for receiving and responding to information about incidents and hazards, and verify that those processes are performing effectively.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Is the code of practice mandatory?</h2>
        <p className="mt-3 text-muted">
          The code is an approved code of practice under section 274 of the Act. It is practical guidance on meeting your duties rather than a separate law. Courts may treat it as evidence of what is known about a hazard and what is reasonably practicable, and an inspector may refer to it when issuing a notice. You may meet your duties another way if it provides an equivalent or higher standard of work health and safety.
        </p>

<h2 className="mt-10 font-serif text-2xl text-ink">What a good record looks like</h2>
        <p className="mt-3 text-muted">
          The code says you should record your risk management process and its outcomes, including consultation with workers, so you can show you met your duties and review your controls later. It also says a WHS inspector may ask to see these records, and that without a written record you will need to show by other means how you met your duties. A strong
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
              <a className="text-accent hover:underline" href="https://www.safework.sa.gov.au/workplaces/psychosocial-hazards" target="_blank" rel="noopener noreferrer">
                SafeWork SA: Psychosocial hazards
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.safework.sa.gov.au/__data/assets/pdf_file/0020/1238123/Managing-Psychosocial-Hazards-at-Work-Code-of-Practice-February-2026.pdf" target="_blank" rel="noopener noreferrer">
                SafeWork SA: Managing Psychosocial Hazards at Work, Code of Practice, February 2026, PDF
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.safework.sa.gov.au/workplaces/psychosocial-hazards/managing-the-risk-of-exposure-to-harmful-behaviours" target="_blank" rel="noopener noreferrer">
                SafeWork SA: Managing the risk of exposure to harmful behaviours
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
