import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, ListChecks } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public article: how to record worker consultation on psychosocial hazards. Brand-only, no byline.
// Sets its own page title, description, canonical link and Article structured data while
// mounted (the app is a single-page app, so there is no per-route <head> to edit).

const TITLE = 'Psychosocial Hazard Examples and Controls | Humanora'
const DESCRIPTION =
  'Four common psychosocial hazards, what they look like at work, and example controls from the Safe Work Australia model code, starting with the ones that change the work itself.'
const PATH = '/articles/psychosocial-hazard-examples-and-controls'

const GAP_CHECK = '/gap-check?utm_source=article&utm_medium=seo&utm_campaign=articles&utm_content=hazards'

export function ArticleHazards() {
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
      headline: 'Psychosocial hazards at work: four examples and the controls that fit them',
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
            <ListChecks size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Psychosocial hazards at work: four examples and the controls that fit them</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 12 November 2026. General information only, not legal advice.
        </p>

        <Card className="mt-6 border-accent/30 bg-accent/5">
          <p className="text-sm text-muted">
            <strong className="text-ink">Rules differ by jurisdiction.</strong> Each state and territory has its own WHS regulator, and each regulator publishes its own codes of practice and regulations. Most are based on the Safe Work Australia model code, but they are not identical, and Victoria and Western Australia run their own frameworks. This article uses the model code as a common reference. Always check the code and regulations that apply where you operate. Our{' '}
            <Link to="/guides" className="text-accent hover:underline">state and territory guides</Link> link to each regulator’s material.
          </p>
        </Card>

        
        <p className="mt-6 text-lg text-muted">
          The model code lists the psychosocial hazards that commonly cause harm, and for each one it gives example controls. The lists are long, which makes them hard to use. Here are four of the most common, what each looks like in practice, and the kind of control the code points to first. The code is clear that its controls are examples. What you must do is eliminate the risk, or minimise it as far as is reasonably practicable, in your own workplace.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Before the examples</h2>
        <p className="mt-3 text-muted">
          Two points from the code shape how to read everything below. A single or occasional exposure to a hazard may create little or no risk, but exposure that is frequent, prolonged or severe can cause psychological and physical harm. And hazards combine, so a heavy workload is a bigger problem when support is poor and the worker has no say in how the work is done.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">1. Job demands</h2>
        <p className="mt-3 text-muted">
          Job demands cover sustained or intense effort that is unreasonable or chronically beyond a worker’s skills, and also sustained low levels of effort. The code describes physical, mental and emotional demands. Examples include long, irregular or on-call hours, too few breaks, time pressure, having to de-escalate aggressive people, and long idle periods or highly repetitive work.
        </p>
        <p className="mt-3 text-muted">
          Controls the code gives, starting with the strongest: schedule non-urgent work for quieter periods, plan shifts so people can recover, roster enough staff to take breaks on busy shifts, rotate people through demanding or repetitive tasks, and add support during peaks. For emotional demands, it suggests letting workers use discretion, for example with refunds, so they can settle a situation instead of absorbing it. Training and realistic targets come after these.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">2. Low job control</h2>
        <p className="mt-3 text-muted">
          This means little say over the work, including how or when it is done. Examples include needing sign-off for routine low-risk tasks, tightly scripted work where workers can’t use their judgement, computer-paced work, no consultation about changes, and being unable to avoid dealing with aggression.
        </p>
        <p className="mt-3 text-muted">
          Controls: match each worker’s autonomy to their skills and experience, streamline approvals for lower-risk tasks, let workers control their own workflow (the code’s example is a system that lets staff decide when the next client is called), and plan deadlines and work allocations with workers. Consultation is itself a control here.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">3. Poor support</h2>
        <p className="mt-3 text-muted">
          This covers inadequate support from supervisors or colleagues, and not having the resources to do the job. Examples include unclear or contradictory information, broken tools or IT systems, supervisors who are always in meetings, workers who can’t ask for help when they need it, and a competitive culture that discourages helping each other.
        </p>
        <p className="mt-3 text-muted">
          Controls: reliable systems for sharing information, supervisors with workloads and spans of control that leave time to supervise, regular goal-focused feedback conversations, equipment that works and is easy to get, extra support in peak periods, and backfilling or redistributing work when people are away.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">4. Remote or isolated work</h2>
        <p className="mt-3 text-muted">
          This is work cut off from other people’s help because of the location, the time or the nature of the work. Examples include lone work on night shifts, work in clients’ homes, long travel times, poor phone reception and fly-in fly-out roles.
        </p>
        <p className="mt-3 text-muted">
          The model WHS Regulation has a specific duty here: you must manage the risks of remote or isolated work, including providing effective communication with the worker. The code points to communication systems, buddy systems, movement records, and training and instruction.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">What the examples have in common</h2>
        <p className="mt-3 text-muted">
          Each strong control changes the work: the schedule, the roster, the approval process, the system, the equipment. Training, policies and awareness sessions have a role, but the code treats them as supporting measures. If your register lists only training against a hazard, that’s a sign to look harder for something stronger.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Choosing between controls</h2>
        <p className="mt-3 text-muted">
          List the options with the people doing the work, since they will think of things you won’t. Then work out which are most effective and which are reasonably practicable. Test the control before relying on it, and set a review date.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Recording it</h2>
        <p className="mt-3 text-muted">
          For each hazard, the record should show what you found, who is affected, the controls chosen and why, who owns each action, and when it will be reviewed. We cover the structure in{' '}
          <Link to="/articles/psychosocial-risk-register" className="text-accent hover:underline">What a psychosocial risk register should contain</Link>, the process in{' '}
          <Link to="/articles/psychosocial-risk-assessment-four-steps" className="text-accent hover:underline">Psychosocial risk assessment: the four steps</Link>, and how to log worker input in{' '}
          <Link to="/articles/recording-worker-consultation-psychosocial-hazards" className="text-accent hover:underline">How to record worker consultation on psychosocial hazards</Link>.
        </p>
        <p className="mt-3 text-muted">
          Humanora is a psychosocial risk management system. It holds your hazard library, controls, owners, review dates and consultation records in one register. You can also see where your own evidence is thin with our free two-minute Gap Check.
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

                <div className="mt-12 border-t border-border pt-6">
          <h2 className="font-serif text-xl text-ink">Sources</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-muted">
            <li>Safe Work Australia: Model Code of Practice, Managing psychosocial hazards at work (July 2022), hazard descriptions and control examples</li>
            <li>Safe Work Australia: Model Work Health and Safety Regulations, regulation 48 (remote or isolated work)</li>
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
