import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Scale } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public state guide: Western Australia. Written from WorkSafe WA's Psychosocial hazards in the
// workplace, Workplace behaviour, and Violence and aggression at work codes of practice (2022). Sets its own page
// title, description and FAQ structured data while mounted (the app is a
// single-page app, so there is no per-route <head> to edit).

const TITLE = 'Psychosocial Hazards WA: Employer Guide | Humanora'
const DESCRIPTION =
  'What Western Australian employers must do under WHS law to manage psychosocial hazards: identify, assess, control, consult, review, and keep a record.'
const PATH = '/guides/wa-psychosocial-hazards'

const GAP_CHECK = '/gap-check?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=wa'
const SIGNUP = '/signup?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=wa'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Does WA law cover mental health?',
    a: 'Yes. The code says health includes both physical and psychological health, and that PCBUs have a primary duty of care under the WHS Act 2020.',
  },
  {
    q: 'Is WA’s code the same as the national model code?',
    a: 'No. It is WorkSafe WA’s own code, issued by the state’s Work Health and Safety Commission, and adapted from SafeWork NSW’s 2021 code.',
  },
  {
    q: 'Which WA codes deal with bullying and violence?',
    a: 'WorkSafe WA has separate codes: Workplace behaviour (bullying, harassment, discrimination and misconduct) and Violence and aggression at work.',
  },
  {
    q: 'Must I follow the code?',
    a: 'It does not have the legal force of a regulation, but a court may use it as a standard. The code’s rule is to follow it or adopt another way that gives the same level of protection.',
  },
  {
    q: 'Must I consult my workers?',
    a: 'Yes. The code says consultation with workers and health and safety representatives is a requirement at each step of the risk management process.',
  },
]

export function GuideWA() {
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
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Psychosocial hazards in Western Australia: what employers must do</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 10 November 2026. General information only, not legal advice. Always check the current
          legislation and WorkSafe WA guidance.
        </p>

                <p className="mt-6 text-lg text-muted">
          In Western Australia, the Work Health and Safety Act 2020 applies to all workplaces, and “health” means both physical and psychological health. A business (a “PCBU” in the Act) must therefore eliminate or minimise the risk of psychological harm so far as is reasonably practicable. WorkSafe WA’s code of practice, <em>Psychosocial hazards in the workplace</em>, explains how. It was published in August 2022 and was last updated by WorkSafe in February 2025.
        </p>
        <p className="mt-4 text-muted">
          This guide sets out what the rules ask of you and what a defensible record looks like.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What is a psychosocial hazard?</h2>
        <p className="mt-3 text-muted">
          The code describes psychosocial hazards as aspects of work and work situations that can lead to psychological or physical harm. They stem from how tasks or jobs are designed, organised, managed and supervised, from tasks with inherent psychosocial hazards, from the equipment or working environment, and from social factors such as workplace relationships and interactions. Examples named in the code include stress, fatigue, burnout, bullying, harassment, violence and aggression, discrimination and misconduct.
        </p>
        <p className="mt-3 text-muted">
          Stress itself is not an injury, but if it becomes frequent, prolonged or severe it can cause psychological and physical harm. The code also stresses that the cumulative effect of low-level exposure can cause injury, not only severe one-off events.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">How Western Australia fits with the rest of Australia</h2>
        <p className="mt-3 text-muted">
          Western Australia has its own Work Health and Safety Act 2020, based on the model laws but separate from the Safe Work Australia model code. WorkSafe WA’s code was issued by the state’s Work Health and Safety Commission, adapting SafeWork NSW’s 2021 code. WA also publishes two companion codes: Violence and aggression at work, and Workplace behaviour (bullying, harassment, discrimination and misconduct). Guidance written for another state does not always carry over.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What WorkSafe WA expects you to do</h2>
        <p className="mt-3 text-muted">
          The code sets out a four-step risk management process, which it describes as a requirement of WHS law, with communication and consultation throughout.
        </p>
        <div className="mt-4 space-y-3">
          <Card>
            <h3 className="font-serif text-lg text-ink">1. Identify psychosocial hazards</h3>
            <p className="mt-1 text-sm text-muted">
              The code suggests drawing on incident reports, complaints, absenteeism, staff turnover, survey results, leave data and exit interviews, as well as consulting workers and health and safety representatives.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">2. Assess the risks</h3>
            <p className="mt-1 text-sm text-muted">
              Consider who might be exposed, the source of the risk, how hazards interact, how severe the risk is (frequency, duration and possible consequences), whether existing controls work, and how urgently to act. The code says assessments should cite the evidence used.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">3. Control the risks</h3>
            <p className="mt-1 text-sm text-muted">
              Eliminate the hazard or risk so far as is reasonably practicable. If you cannot, minimise it so far as is reasonably practicable. The code ranks controls from elimination, to risk minimisation (engineering, substitution and isolation), to administrative controls and PPE, and says to apply elimination supplemented by minimisation and administrative controls.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">4. Monitor and review</h3>
            <p className="mt-1 text-sm text-muted">
              Check that controls are working and have not created new risks. The code suggests a standing agenda item at management, staff and health and safety committee meetings, and tracking grievances, turnover and employee assistance program use.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">Consult throughout</h3>
            <p className="mt-1 text-sm text-muted">
              The code says consultation with workers and health and safety representatives is a requirement at each step of the process, including when changing or reviewing controls.
            </p>
          </Card>
        </div>
        <h2 className="mt-10 font-serif text-2xl text-ink">Information, training and leadership</h2>
        <p className="mt-3 text-muted">
          The code says a PCBU must provide adequate and suitable information, training, instruction or supervision to workers, including supervisors and managers. It names leadership commitment as a key factor for success, and says leaders should model the behaviour they expect. It also warns that a punitive culture, where workers face consequences for raising concerns or making mistakes, can itself become a risk.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Two companion codes</h2>
        <p className="mt-3 text-muted">
          WorkSafe WA’s other 2022 codes work alongside the psychosocial code, and both say to read them together.
        </p>
        <p className="mt-3 text-muted">
          <strong className="text-ink">Workplace behaviour</strong> covers bullying, harassment (including sexual harassment), discrimination and misconduct by workers. <strong className="text-ink">Violence and aggression at work</strong> covers threats and assaults, including sexual harassment and sexual assault, from customers, clients, patients, students and other external parties, and sets out the steps for developing a prevention plan. Both codes say sexual harassment should be reported to WorkSafe WA if it meets the notification threshold.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Officers have a duty too</h2>
        <p className="mt-3 text-muted">
          Under the Act, officers such as company directors must exercise due diligence to make sure the business meets its WHS duties. The code says this includes taking reasonable steps to make sure the business has and uses appropriate resources and processes to eliminate or minimise these risks.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Is the code of practice mandatory?</h2>
        <p className="mt-3 text-muted">
          The code says it does not have the same legal force as a regulation and is not, by itself, sufficient reason for prosecution, but a court may use it as a standard when assessing other methods. It also sets the rule that you should either do what the code says, or adopt another way that gives the same level of protection.
        </p>

<h2 className="mt-10 font-serif text-2xl text-ink">What a good record looks like</h2>
        <p className="mt-3 text-muted">
          The code says PCBUs should demonstrate that psychosocial hazards and risk factors have been considered and recorded as part of their hazard identification and risk management process, and that assessments should be reviewed and updated regularly, including when workplace changes are made. A strong
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
              <a className="text-accent hover:underline" href="https://www.worksafe.wa.gov.au/publications/code-practice-psychosocial-hazards-workplace" target="_blank" rel="noopener noreferrer">
                WorkSafe WA: Psychosocial hazards in the workplace, Code of practice
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.worksafe.wa.gov.au/system/files/migrated/sites/default/files/atoms/files/221154_cp_psychosocialhazards.pdf" target="_blank" rel="noopener noreferrer">
                WorkSafe WA: Psychosocial hazards in the workplace, Code of practice, PDF
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.worksafe.wa.gov.au/publications/code-practice-workplace-behaviour" target="_blank" rel="noopener noreferrer">
                WorkSafe WA: Workplace behaviour, Code of practice
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.worksafe.wa.gov.au/publications/code-practice-violence-and-aggression-work" target="_blank" rel="noopener noreferrer">
                WorkSafe WA: Violence and aggression at work, Code of practice
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
