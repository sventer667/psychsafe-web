import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Scale } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public state guide: Queensland. Written from WorkSafe Queensland's published
// code of practice pages and sexual harassment guide for PCBUs. Sets its own page
// title, description and FAQ structured data while mounted (the app is a
// single-page app, so there is no per-route <head> to edit).

const TITLE = 'Psychosocial Hazards Queensland: Employer Guide | Humanora'
const DESCRIPTION =
  'What Queensland employers must do under WHS law to manage psychosocial hazards: identify, assess, control, consult, review, and keep a record.'
const PATH = '/guides/queensland-psychosocial-hazards'

const GAP_CHECK = '/gap-check?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=qld'
const SIGNUP = '/signup?utm_source=guide&utm_medium=seo&utm_campaign=state_guides&utm_content=qld'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'When did Queensland’s psychosocial risk rules start?',
    a: 'On 1 April 2023, when the Work Health and Safety (Psychosocial Risks) Amendment Regulation 2022 and the Managing the risk of psychosocial hazards at work Code of Practice 2022 took effect.',
  },
  {
    q: 'Does WHS law in Queensland cover mental health?',
    a: 'Yes. The WHS Act 2011 defines health as both physical and psychological health.',
  },
  {
    q: 'Does the code create new legal duties?',
    a: 'No. WorkSafe Queensland says it gives practical guidance on existing duties and examples of how to meet them.',
  },
  {
    q: 'Do I have to consult my workers?',
    a: 'Yes. You must consult workers when identifying hazards and assessing risks to health and safety.',
  },
  {
    q: 'Do I need a written plan for sexual harassment?',
    a: 'Yes, if you identify a risk of sexual harassment or sex or gender-based harassment. From 1 March 2025 the WHS Regulation requires a written prevention plan, reviewed at least every three years.',
  },
  {
    q: 'Does a small business have to follow the same rules?',
    a: 'Yes. The code and the Regulation apply to businesses of all sizes covered by the Act. WorkSafe Queensland publishes a psychological health and safety guide for small business.',
  },
]

export function GuideQLD() {
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
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Psychosocial hazards in Queensland: what employers must do</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 10 November 2026. General information only, not legal advice. Always check the current
          legislation and WorkSafe Queensland guidance.
        </p>

        <p className="mt-6 text-lg text-muted">
          In Queensland, the Work Health and Safety Act 2011 defines “health” as both physical and psychological health. A business (a “PCBU” in the Act) must therefore manage risks to psychological health so far as is reasonably practicable, in the same way it manages risks to physical health. Specific psychosocial risk provisions were added to the Work Health and Safety Regulation 2011 by the Work Health and Safety (Psychosocial Risks) Amendment Regulation 2022. WorkSafe Queensland’s Managing the risk of psychosocial hazards at work Code of Practice 2022 explains how to meet them. Both took effect on <strong className="text-ink">1 April 2023</strong>.
        </p>
        <p className="mt-4 text-muted">
          This guide sets out what the rules ask of you and what a defensible record looks like.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What is a psychosocial hazard?</h2>
        <p className="mt-3 text-muted">
          A psychosocial hazard is anything in how work is designed, organised, managed or carried out, or in the work environment and workplace relationships, that could cause psychological or physical harm. Common examples include high or low job demands, poor support, bullying, harassment (including sexual harassment) and exposure to traumatic events.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">How Queensland fits with the rest of Australia</h2>
        <p className="mt-3 text-muted">
          Queensland uses the model Work Health and Safety laws, which most states and territories share. Psychosocial risk is covered by specific provisions in the WHS Regulation. Victoria is the main exception, with its own standalone regulations, so guidance written for Victoria does not always carry over.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What WorkSafe Queensland expects you to do</h2>
        <p className="mt-3 text-muted">
          The code sets out a four-step risk management process, with consultation throughout.
        </p>
        <div className="mt-4 space-y-3">
          <Card>
            <h3 className="font-serif text-lg text-ink">1. Identify psychosocial hazards</h3>
            <p className="mt-1 text-sm text-muted">
              Find the reasonably foreseeable hazards in how work is designed and managed at your workplace.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">2. Assess the risks</h3>
            <p className="mt-1 text-sm text-muted">
              Work out how likely each hazard is to cause harm, and how serious the harm could be.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">3. Control the risks</h3>
            <p className="mt-1 text-sm text-muted">
              Eliminate the risk so far as is reasonably practicable. If you cannot, minimise it so far as is reasonably practicable.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">4. Review your controls</h3>
            <p className="mt-1 text-sm text-muted">
              Check that controls are working and revisit them when circumstances change.
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-ink">Consult throughout</h3>
            <p className="mt-1 text-sm text-muted">
              You must consult workers when identifying hazards and assessing risks to health and safety.
            </p>
          </Card>
        </div>
        <h2 className="mt-10 font-serif text-2xl text-ink">Things that are easy to miss</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted">
          <li>
            <strong className="text-ink">Duties cannot be handed off.</strong> A PCBU cannot transfer or delegate its duties to someone else. Where duties overlap with another duty holder, each must, so far as is reasonably practicable, consult, cooperate and coordinate.
          </li>
          <li>
            <strong className="text-ink">Third parties count.</strong> Your duty includes protecting workers from harm caused by others, such as customers, patients or members of the public.
          </li>
          <li>
            <strong className="text-ink">Officers have a duty.</strong> Company directors and senior managers must exercise due diligence to make sure the business meets its WHS duties.
          </li>
          <li>
            <strong className="text-ink">Size is no exemption.</strong> The code and the Regulation apply to PCBUs of all sizes covered by the Act. WorkSafe publishes a small business guide.
          </li>
        </ul>
        <h2 className="mt-10 font-serif text-2xl text-ink">Sexual harassment: a written prevention plan is now required</h2>
        <p className="mt-3 text-muted">
          Queensland has gone further than most states on sexual harassment and sex or gender-based harassment. Since <strong className="text-ink">1 September 2024</strong>, the WHS Regulation specifically requires businesses to manage the risk of both. WorkSafe Queensland’s guide for PCBUs explains how.
        </p>
        <p className="mt-3 text-muted">
          From <strong className="text-ink">1 March 2025</strong>, if you identify a risk of either, you must prepare and implement a <strong className="text-ink">written prevention plan</strong>. The plan must:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted">
          <li>state each identified risk</li>
          <li>identify the control measures in place or planned for each risk</li>
          <li>identify the matters you considered when choosing those controls</li>
          <li>describe the consultation you carried out</li>
          <li>set out your procedures for dealing with reports</li>
          <li>be expressed in a way workers can readily access and understand</li>
        </ul>
        <p className="mt-3 text-muted">
          You must also take reasonable steps to make sure workers know the plan exists and how to find it. Review it as soon as practicable after a report is made, or after a health and safety committee or representative asks for a review, and otherwise at least every three years. WorkSafe provides a template, but using it is optional. You can meet the requirement with your own documents if they cover the same points.
        </p>
        <p className="mt-3 text-muted">
          The plan is about prevention, not a complaints policy. WorkSafe’s guide stresses acting before harassment happens, and notes that harassment can come from co-workers, managers, customers, clients or other third parties, and can occur on work trips, at work social events, online and in worker accommodation.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Is the code of practice mandatory?</h2>
        <p className="mt-3 text-muted">
          WorkSafe Queensland says the code does not create new duties. It gives practical guidance on existing duties, with examples of how to meet them. It is an approved code of practice under the WHS Act, so following it is the most direct way to show you took reasonable steps. You can use a different approach, but it must achieve a standard that is equal to or better than the code.
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
            <li className="text-muted">Workplace Health and Safety Queensland: Managing the risk of sexual harassment and sex or gender-based harassment at work, Guide for PCBUs</li>
            <li>
              <a className="text-accent hover:underline" href="https://www.worksafe.qld.gov.au/laws-and-compliance/codes-of-practice/managing-the-risk-of-psychosocial-hazards-at-work-code-of-practice-2022" target="_blank" rel="noopener noreferrer">
                WorkSafe Queensland: Managing the risk of psychosocial hazards at work Code of Practice 2022
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.worksafe.qld.gov.au/laws-and-compliance/codes-of-practice/managing-the-risk-of-psychosocial-hazards-at-work-code-of-practice-2022/nested-content/employers" target="_blank" rel="noopener noreferrer">
                WorkSafe Queensland: Code of practice, for employers
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="https://www.legislation.qld.gov.au/view/whole/html/asmade/sl-2022-0141" target="_blank" rel="noopener noreferrer">
                Queensland Legislation: Work Health and Safety (Psychosocial Risks) Amendment Regulation 2022
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
