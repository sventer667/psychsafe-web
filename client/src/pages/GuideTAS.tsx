import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Scale } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public state guide: Tasmania. Written from WorkSafe Tasmania's published
// pages and the Managing psychosocial hazards at work Code of Practice. Sets its own page
// title, description and FAQ structured data while mounted (the app is a
// single-page app, so there is no per-route <head> to edit).

const TITLE = 'Psychosocial Hazards Tasmania: Employer Guide | Humanora'
const DESCRIPTION =
  'What Tasmanian employers must do under WHS law to manage psychosocial hazards: identify, control, consult, review, and keep a record.'
const PATH = '/guides/tasmania-psychosocial-hazards'

const GAP_CHECK = '/gap-check?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=tas'
const SIGNUP = '/signup?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=tas'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'When did Tasmania’s psychosocial risk rules start?',
    a: 'WorkSafe Tasmania’s Executive Director has said the amendment to the Work Health and Safety Regulations 2022 came into force on 30 November 2022. The code of practice took effect on 4 January 2023.',
  },
  {
    q: 'Does the code apply to small businesses?',
    a: 'Yes. The code applies to all workplaces covered by the WHS Act.',
  },
  {
    q: 'Is stress covered, or only bullying?',
    a: 'Both. The code covers job demands, job control, support, role clarity and recognition as well as bullying, harassment and violence.',
  },
  {
    q: 'Must I keep written records?',
    a: 'The code says you should. Records are how you show you met your duties, and an inspector may ask to see them.',
  },
  {
    q: 'Where can I get help?',
    a: 'WorkSafe Tasmania offers free tools, including the People at Work risk assessment tool and Head4Work training.',
  },
]

export function GuideTAS() {
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
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Psychosocial hazards in Tasmania: what employers must do</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 10 November 2026. General information only, not legal advice. Always check the current
          legislation and WorkSafe Tasmania guidance.
        </p>

        <p className="mt-6 text-lg text-muted">
          Tasmania’s work health and safety laws name psychosocial hazards specifically. The Work Health and Safety Regulations 2022 were amended in late 2022 to include a regulation that sets out what workplaces must do to manage psychosocial risks. WorkSafe Tasmania’s code of practice, Managing psychosocial hazards at work, gives practical guidance on meeting those requirements. It has been in effect in Tasmania since <strong className="text-ink">4 January 2023</strong> and applies to all workplaces covered by the WHS Act.
        </p>
        <p className="mt-4 text-muted">
          This guide sets out what the rules ask of you and what a defensible record looks like.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Why it matters now</h2>
        <p className="mt-3 text-muted">
          WorkSafe Tasmania reports that mental health injuries in the state rose 86% over ten years, with 857 reported in 2021-22. Just over one injury in every ten is now mental health related, compared with about one in twenty a decade earlier. WorkSafe’s Executive Director has said that work pressure is the cause of the majority of mental health injuries in Tasmania. The code notes that, on average, work-related psychological injuries have longer recovery times, higher costs and need more time away from work than other injuries.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What is a psychosocial hazard?</h2>
        <p className="mt-3 text-muted">
          The code defines psychosocial hazards as hazards that arise from or in relation to the design or management of work, the working environment, plant at a workplace, or workplace interactions or behaviours, and that may cause psychological and physical harm. It lists common hazards including job demands, low job control, poor support, lack of role clarity, poor change management, inadequate recognition and reward, poor organisational justice, traumatic events, remote or isolated work, and a poor physical environment, along with harmful behaviours such as bullying and harassment.
        </p>
        <p className="mt-3 text-muted">
          Stress itself is not an injury, but if it becomes frequent, prolonged or severe it can cause psychological and physical harm.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">How Tasmania fits with the rest of Australia</h2>
        <p className="mt-3 text-muted">
          Tasmania uses the model Work Health and Safety laws, which most states and territories share. Psychosocial risk is covered by a specific regulation in the Work Health and Safety Regulations 2022. Victoria is the main exception, with its own standalone regulations, so guidance written for Victoria does not always carry over.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What the rules ask of you</h2>
        <p className="mt-3 text-muted">
          Under the WHS Regulations, a business (a “PCBU”) managing psychosocial risks must:
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
            <h3 className="font-serif text-lg text-ink">3. Minimise the risks</h3>
            <p className="mt-1 text-sm text-muted">
              If elimination is not reasonably practicable, minimise the risks so far as is reasonably practicable.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">4. Maintain the controls</h3>
            <p className="mt-1 text-sm text-muted">
              Keep the controls you put in place working so they remain effective.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">5. Review, and revise if needed</h3>
            <p className="mt-1 text-sm text-muted">
              The code says review is required when a control is not working, before a workplace change likely to create a new or different risk, when a new hazard or risk is identified, when consultation indicates a review is needed, or when a health and safety representative asks for one.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">Consult throughout</h3>
            <p className="mt-1 text-sm text-muted">
              You must consult workers when assessing risks or making decisions about psychosocial risks, including which controls you use. Consultation must include any health and safety representatives. The code says to take particular care to involve workers who may be more exposed, such as young workers, workers from culturally and linguistically diverse backgrounds, LGBTIQA+ workers and workers with disability.
            </p>
          </Card>
        </div>
        <h2 className="mt-10 font-serif text-2xl text-ink">Choosing controls</h2>
        <p className="mt-3 text-muted">
          When deciding on controls, you must have regard to all relevant matters, including how long, how often and how severely workers are exposed, how hazards may interact or combine, the design of work and job demands, systems of work, the workplace environment, workplace interactions and behaviours, and the information, training, instruction and supervision provided.
        </p>
        <p className="mt-3 text-muted">
          The code says to find as many possible controls as you can with your workers, order them from most to least effective, and then decide which are reasonably practicable. Controls that change how work is designed and managed are the most effective. Administrative controls, such as policies, are the least reliable and should be used last and combined with stronger controls, because policies can be ignored and procedures misunderstood.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Officers have a duty too</h2>
        <p className="mt-3 text-muted">
          Company directors and other officers must exercise due diligence to make sure the business meets these duties. For psychosocial risk, the code says this includes keeping up to date with the subject, understanding the psychosocial hazards in the business’s operations, making sure the business has and uses appropriate resources and processes, and checking that those processes are working.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Is the code of practice mandatory?</h2>
        <p className="mt-3 text-muted">
          The code is an approved code of practice under the WHS Act. It is practical guidance on meeting duties rather than a separate law, but it matters in practice. Courts may treat it as evidence of what is known about a hazard and what is reasonably practicable, and an inspector may refer to it when issuing a notice. You may meet your duties another way if it provides an equivalent or higher standard of safety than the code.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">How is it enforced?</h2>
        <p className="mt-3 text-muted">
          WorkSafe Tasmania investigates whether there has been a breach of duties under the work health and safety laws. It has said it is developing a psychosocial hazards regulation strategy covering priority hazards, priority industries and its approach to compliance and enforcement.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What a good record looks like</h2>
        <p className="mt-3 text-muted">
          The code says you should record your risk management process and outcomes, including consultation with
          workers, so you can show you met your duties and review your controls later. It also says an inspector may
          ask to see these records, and that without a written record you will need to show by other means how you met
          your duties. A strong record is dated and specific:
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
              <a className="text-accent hover:underline" href="https://worksafe.tas.gov.au/topics/laws-and-compliance/codes-of-practice/cop-folder/managing-psychosocial-hazards-at-work" target="_blank" rel="noopener noreferrer">
                WorkSafe Tasmania: Managing psychosocial hazards at work, Code of Practice
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.worksafe.tas.gov.au/about/from-our-executive-director/psychosocial-hazards-in-the-workplace" target="_blank" rel="noopener noreferrer">
                WorkSafe Tasmania: Psychosocial hazards in the workplace, column by the Executive Director
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://worksafe.tas.gov.au/topics/Health-and-Safety/hazards-and-solutions-a-z/hazards-and-solutions-a-z-pages/p/psychosocial-hazards2/worksafes-role-in-complaints" target="_blank" rel="noopener noreferrer">
                WorkSafe Tasmania: WorkSafe’s role in complaints
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
