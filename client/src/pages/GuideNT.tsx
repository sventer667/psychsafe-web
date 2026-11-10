import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Scale } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public state guide: Northern Territory. Written from NT WorkSafe's Managing psychosocial hazards at work and
// Sexual and gender-based harassment codes of practice. Sets its own page
// title, description and FAQ structured data while mounted (the app is a
// single-page app, so there is no per-route <head> to edit).

const TITLE = 'Psychosocial Hazards NT: Employer Guide | Humanora'
const DESCRIPTION =
  'What Northern Territory employers must do under WHS law to manage psychosocial hazards: identify, control, consult, review, and keep a record.'
const PATH = '/guides/nt-psychosocial-hazards'

const GAP_CHECK = '/gap-check?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=nt'
const SIGNUP = '/signup?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=nt'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'When did the Northern Territory’s psychosocial regulations start?',
    a: 'On 1 July 2023, according to NT WorkSafe.',
  },
  {
    q: 'Does the Northern Territory use the hierarchy of controls for psychosocial hazards?',
    a: 'Yes. Eliminate first; if that is not reasonably practicable, minimise using substitution, isolation or engineering controls, then administrative controls, then PPE.',
  },
  {
    q: 'Does the Northern Territory have a code on sexual harassment?',
    a: 'Yes. NT WorkSafe has a Sexual and Gender-Based Harassment Code of Practice, based on the Safe Work Australia model code.',
  },
  {
    q: 'Must I notify NT WorkSafe of a serious psychological injury?',
    a: 'The code says a notifiable incident includes serious psychological or physical injury or illness requiring immediate in-patient hospital treatment, and the regulator must be notified.',
  },
  {
    q: 'Is the code compulsory?',
    a: 'It is an approved code of practice, not a separate law. You may meet your duties another way if it provides an equivalent or higher standard of work health and safety.',
  },
]

export function GuideNT() {
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
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Psychosocial hazards in the Northern Territory: what employers must do</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 10 November 2026. General information only, not legal advice. Always check the current
          legislation and NT WorkSafe guidance.
        </p>

                                <p className="mt-6 text-lg text-muted">
          Since <strong className="text-ink">1 July 2023</strong>, the Northern Territory has had specific work health and safety regulations on psychosocial hazards. NT WorkSafe described them as clarifying an existing duty under the Work Health and Safety (National Uniform Legislation) Act 2011 rather than adding new requirements. NT WorkSafe’s code of practice, <em>Managing psychosocial hazards at work</em>, is an approved code of practice under section 274 of that Act, based on the Safe Work Australia model code. It applies to all workplaces covered by the Act.
        </p>
        <p className="mt-4 text-muted">
          This guide sets out what the rules ask of you and what a defensible record looks like.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What is a psychosocial hazard?</h2>
        <p className="mt-3 text-muted">
          The Northern Territory code uses the Safe Work Australia model code’s description: hazards that arise from, or relate to, the design or management of work, the working environment, plant at a workplace, or workplace interactions or behaviours, and that may cause psychological harm (whether or not they also cause physical harm). Its appendices cover job demands, low job control, poor support, lack of role clarity, poor change management, inadequate recognition and reward, poor organisational justice, traumatic events or material, remote or isolated work, and a poor physical environment, along with harmful behaviours such as bullying, harassment (including sexual harassment) and violence and aggression.
        </p>
        <p className="mt-3 text-muted">
          The code also says you are not required to manage stressors that arise wholly from a worker’s personal circumstances, such as pre-existing health issues, legal matters, family problems, addiction or personal finances. You must still make sure work-related hazards do not create further harm, so far as is reasonably practicable.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">How the Northern Territory fits with the rest of Australia</h2>
        <p className="mt-3 text-muted">
          The Northern Territory uses the model Work Health and Safety laws, which most states and territories share, and its code is based on Safe Work Australia’s model code. Victoria is the main exception, with its own standalone regulations, so guidance written for Victoria does not always carry over.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What the rules ask of you</h2>
        <p className="mt-3 text-muted">
          Under the WHS Regulations, a business (a “PCBU”) managing psychosocial risk must:
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
              Use the hierarchy of controls to minimise the risks so far as is reasonably practicable.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">4. Maintain your controls</h3>
            <p className="mt-1 text-sm text-muted">
              Keep your controls in place so they remain effective.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">5. Review, and revise if necessary</h3>
            <p className="mt-1 text-sm text-muted">
              Review your controls, and revise them if necessary, to keep a work environment without risks to health and safety, so far as is reasonably practicable.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">Consult throughout</h3>
            <p className="mt-1 text-sm text-muted">
              The code says consultation with workers and their health and safety representatives supports every step of the process.
            </p>
          </Card>
        </div>
        <h2 className="mt-10 font-serif text-2xl text-ink">Choosing controls</h2>
        <p className="mt-3 text-muted">
          When deciding on controls you must have regard to all relevant matters, including how long, how often and how severely workers are exposed, how hazards interact or combine, the design of work and job demands, systems of work, the design, layout and conditions of the workplace and workers’ accommodation, plant, substances and structures, workplace interactions and behaviours, and the information, training, instruction and supervision provided.
        </p>
        <p className="mt-3 text-muted">
          The code applies the hierarchy of controls: eliminate first, then minimise through substitution, isolation or engineering controls, then administrative controls, then personal protective equipment. It says controls should mostly be set at the level of work and system design rather than individual resilience, and that administrative controls and PPE do not control a hazard at its source.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">When you must review your controls</h2>
        <p className="mt-3 text-muted">
          The code says controls should be reviewed regularly. A review is also required when a control is not eliminating or minimising the risk so far as is reasonably practicable, before a workplace change likely to create a new or different risk, when a new hazard or risk is identified, when consultation indicates it is needed, or when a health and safety representative reasonably asks for one. Reports, complaints (including informal ones) and grievances should trigger a review of whether your controls and your response procedures are working.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">A second code covers sexual and gender-based harassment</h2>
        <p className="mt-3 text-muted">
          The Northern Territory also has a Sexual and Gender-Based Harassment Code of Practice, an approved code of practice under the same section of the Act, also based on the Safe Work Australia model code. It treats sexual and gender-based harassment as a psychosocial hazard to be managed through the same risk management process. The code also points to the Commonwealth Sex Discrimination Act 1984, which includes a separate positive duty to take reasonable and proportionate measures to prevent sexual harassment and related unlawful conduct. That duty operates alongside WHS duties.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Serious incidents must be notified</h2>
        <p className="mt-3 text-muted">
          The code says that as soon as you become aware of a notifiable incident you must make sure the regulator is notified. A notifiable incident includes the death of a person, or a serious psychological or physical injury or illness that needs immediate treatment as an in-patient in hospital. You must keep records of notifiable incidents for at least five years.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Officers have a duty too</h2>
        <p className="mt-3 text-muted">
          Officers, such as company directors, must exercise due diligence to make sure the business meets its duties. For psychosocial risk the code says this means taking reasonable steps to keep up to date with the subject, understand the psychosocial hazards in the business’s operations, make sure the business has and uses appropriate resources and processes, make sure it has processes for receiving and responding to information about incidents and hazards, and verify that those processes are performing effectively.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Is the code of practice mandatory?</h2>
        <p className="mt-3 text-muted">
          The code is an approved code of practice under section 274 of the Act. It is practical guidance on meeting your duties rather than a separate law. Courts may treat it as evidence of what is known about a hazard and what is reasonably practicable, and an inspector may refer to it when issuing a notice. You may meet your duties another way if it provides an equivalent or higher standard of work health and safety.
        </p>

<h2 className="mt-10 font-serif text-2xl text-ink">What a good record looks like</h2>
        <p className="mt-3 text-muted">
          The code says you should record your risk management process and its outcomes, including consultation with workers, so you can show you met your duties and review your controls later. A strong
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
              <a className="text-accent hover:underline" href="https://worksafe.nt.gov.au/forms-and-resources/codes-of-practice/managing-psychosocial-hazards-at-work" target="_blank" rel="noopener noreferrer">
                NT WorkSafe: Managing psychosocial hazards at work, Code of Practice
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://worksafe.nt.gov.au/__data/assets/pdf_file/0010/1379710/code-of-practice-managing-psychosocial-hazards-at-work.pdf" target="_blank" rel="noopener noreferrer">
                NT WorkSafe: Managing psychosocial hazards at work, Code of Practice, PDF
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://worksafe.nt.gov.au/__data/assets/pdf_file/0003/1379712/code-of-practice-sexual-and-gender-based-harassment.pdf" target="_blank" rel="noopener noreferrer">
                NT WorkSafe: Sexual and gender-based harassment, Code of Practice, PDF
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://worksafe.nt.gov.au/forms-and-resources/news-and-events/media-releases/2023/new-laws-and-code-of-practice-in-place-to-protect-workplace-mental-health" target="_blank" rel="noopener noreferrer">
                NT WorkSafe: New laws and code of practice in place to protect workplace mental health
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
