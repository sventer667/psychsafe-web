import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, ClipboardList } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public article: how to record worker consultation on psychosocial hazards. Brand-only, no byline.
// Sets its own page title, description, canonical link and Article structured data while
// mounted (the app is a single-page app, so there is no per-route <head> to edit).

const TITLE = 'Psychosocial Risk Assessment: Four Steps | Humanora'
const DESCRIPTION =
  'The four steps of managing psychosocial risk under the Safe Work Australia model code: identify, assess, control and review, with a worked example from a council service counter.'
const PATH = '/articles/psychosocial-risk-assessment-four-steps'

const GAP_CHECK = '/gap-check?utm_source=article&utm_medium=seo&utm_campaign=articles&utm_content=assessment'

export function ArticleAssessment() {
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
      headline: 'Psychosocial risk assessment: the four steps, with a worked example',
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
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} /> Back to Humanora
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <ClipboardList size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Psychosocial risk assessment: the four steps, with a worked example</h1>
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
          “Do a psychosocial risk assessment” sounds like one task. It isn’t. The model code describes a four-step process, and the assessment itself is only the second step. Most of the work, and most of the evidence an inspector would want, sits in the steps either side of it. Here is each step in plain terms, followed by a worked example.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Before you start</h2>
        <p className="mt-3 text-muted">
          The code suggests four things before you begin. Explain the process to the people involved. Get commitment from senior leaders and managers. Work out who needs to take part: managers, workers, health and safety representatives, and any specialists. And decide how the process and its outcomes will be recorded and communicated.
        </p>
        <p className="mt-3 text-muted">
          That last point is easy to skip and hard to fix afterwards. If you decide the record format at the start, you collect what you need as you go.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Step 1: Identify hazards</h2>
        <p className="mt-3 text-muted">
          You need to find the psychosocial hazards that could reasonably arise from your work, including the less common but serious ones, such as physical or sexual assault. The code says to consult workers while you do this, including any health and safety representatives.
        </p>
        <p className="mt-3 text-muted">
          Three things help here.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Listen for the different ways people describe it.</em> Workers rarely say “role ambiguity”. They say they feel confused about what the job involves, anxious about dealing with an aggressive person, or angry about rules being applied unevenly. The job is to work out the underlying cause.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Look at what you already hold.</em> The code lists the records that can point to hazards: injury and workers’ compensation records, complaints and investigations, workplace inspection reports, hours worked, absence and turnover data, exit interviews, committee meeting records, and earlier assessments. Not every hazard shows up in an incident report, so these are a starting point.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Watch the work.</em> Are people rushed? Are tasks delayed? Do certain jobs lead to mistakes or confusion? How do people treat each other, and customers and clients? The code also notes that poor behaviour can be a response to other hazards, such as high demands or unclear roles.
        </p>
        <p className="mt-3 text-muted">
          A reporting channel matters too. The code suggests making it easy for workers to report hazards, including anonymously, and says reports should be taken seriously. People stay quiet when they think nothing will happen, or fear being blamed.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Step 2: Assess the risks, if necessary</h2>
        <p className="mt-3 text-muted">
          For each hazard, work out who is affected and consider three things:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li><strong className="text-ink">Duration:</strong> how long are they exposed?</li>
          <li><strong className="text-ink">Frequency:</strong> how often?</li>
          <li><strong className="text-ink">Severity:</strong> how bad is the hazard and the exposure?</li>
        </ul>
        <p className="mt-3 text-muted">
          Two points from the code are worth highlighting. First, look at hazards together, not one by one, because they interact. A worker facing an aggressive customer is more at risk if no colleague is nearby and they can’t change how they respond. Second, risk goes up when exposure is more severe, more frequent or longer, and especially when these combine, such as a short, severe incident on top of ongoing low support.
        </p>
        <p className="mt-3 text-muted">
          The code also says this step “may not be necessary” if you already know the risk and how to control it. In that case you can put the controls in place and check afterwards that they worked. That doesn’t remove the need for a record of what you knew and did.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Step 3: Control the risks</h2>
        <p className="mt-3 text-muted">
          You must eliminate the risk if that is reasonably practicable. If it isn’t, you must minimise it as far as is reasonably practicable. The code gives a three-part approach: list as many possible controls as you can (with workers, since they will think of things you won’t), work out which are most effective, then decide which are reasonably practicable.
        </p>
        <p className="mt-3 text-muted">
          The code says that minimising risk mostly means changing the design of work, the systems of work, the environment, the way people interact, or the equipment used. It also sets out the hierarchy: substitution, isolation and engineering controls for physical contributors, then administrative controls and personal protective equipment last. It describes administrative controls as among the least reliable, because policies get ignored and training fades, and says to use them alongside stronger controls, not in place of them.
        </p>
        <p className="mt-3 text-muted">
          On cost, the code is direct. Cost counts, but only after you’ve assessed the risk and the ways of reducing it. If the cost is grossly disproportionate, you still have to use a cheaper way to reduce the risk. A tight budget isn’t an excuse to do less.
        </p>
        <p className="mt-3 text-muted">
          Before relying on a control, test it. Give workers time to adjust, then check with them how it’s going.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Step 4: Review the controls</h2>
        <p className="mt-3 text-muted">
          Check regularly that the controls work as planned. The code says a review is required when a control isn’t reducing the risk enough, before a workplace change that could create a new risk, when a new hazard turns up, when consultation suggests it’s needed, or when a health and safety representative reasonably asks for one. Complaints and grievances, including informal ones, should also prompt a look at whether your controls and your response processes are working.
        </p>
        <p className="mt-3 text-muted">
          The person doing the review should have the authority and resources to do it properly, and to recommend changes. If a control isn’t working, you go back through the earlier steps.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">A worked example (illustration only)</h2>
        <p className="mt-3 text-muted">
          Picture the customer service counter at a regional council, with eight staff and a steady stream of rates and fines enquiries.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Identify.</em> A health and safety representative mentions at a team meeting that staff dread the first week after rates notices go out. Incident reports show verbal abuse, mostly at the counter. Sick leave rises in the same period. Staff say they feel “on edge” and “like nobody backs us up”.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Assess.</em> Who is affected: the eight counter staff. Duration: a few weeks each quarter. Frequency: several abusive incidents a day in the peak week. Severity: shouting and threats, no physical violence so far. The assessment also notes a second hazard that makes things worse: counter staff often work alone at lunchtime.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Control.</em> The team lists options. Eliminate: let people pay and query rates online, so fewer people come to the counter. That is not fully possible, but it can cut numbers. Minimise: add a second person to the counter in peak weeks, redesign the counter so staff have an escape route and a clear line to colleagues, and change the roster so nobody is alone. Administrative controls come last: de-escalation training and a clear written procedure for ending an abusive interaction, used alongside the stronger measures.
        </p>
        <p className="mt-3 text-muted">
          <em className="text-ink">Review.</em> The team picks a review date three months out. They will check incident numbers, sick leave and what staff say. If abuse is still frequent, they go back to the control options.
        </p>
        <p className="mt-3 text-muted">
          Notice that the strongest measures change the work: fewer visits, more people, a safer layout. Training sits at the end of the list, not the start.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-ink">Common mistakes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li><strong className="text-ink">Treating the assessment as the whole job.</strong> Identification, controls and review are where most of the work and most of the evidence sit.</li>
          <li><strong className="text-ink">Stopping at a survey.</strong> The code says surveys can be a useful tool, but they shouldn’t replace the consultation arrangements you’ve agreed with workers.</li>
          <li><strong className="text-ink">Rating hazards one at a time.</strong> They combine, and so do the effects.</li>
          <li><strong className="text-ink">Starting with training.</strong> It’s the easiest control to buy and among the weakest.</li>
          <li><strong className="text-ink">No review date.</strong> A control nobody checks is an assumption.</li>
          <li><strong className="text-ink">No record.</strong> If it isn’t written down, you can’t show it happened.</li>
        </ul>
        <h2 className="mt-10 font-serif text-2xl text-ink">Keeping the record</h2>
        <p className="mt-3 text-muted">
          The code says you should record the process and its outcomes, including consultation, so you can show you met your duties and so you have something to work from at the next review. A register that holds each hazard, its rating, the controls, owners, dates and consultation does that. We cover how to build one in{' '}
          <Link to="/articles/psychosocial-risk-register" className="text-accent hover:underline">What a psychosocial risk register should contain</Link>, and how to record consultation in{' '}
          <Link to="/articles/recording-worker-consultation-psychosocial-hazards" className="text-accent hover:underline">How to record worker consultation on psychosocial hazards</Link>.
        </p>
        <p className="mt-3 text-muted">
          Humanora is a psychosocial risk management system built around these four steps. You can also see where your own evidence is thin with our free two-minute Gap Check.
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
            <li>Safe Work Australia: Model Code of Practice, Managing psychosocial hazards at work (2022), chapters 2 to 7</li>
            <li>SafeWork SA: Managing Psychosocial Hazards at Work, Code of Practice (February 2026)</li>
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
