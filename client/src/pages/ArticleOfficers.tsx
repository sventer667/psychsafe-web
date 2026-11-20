import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Landmark } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public article: officers' due diligence and psychosocial hazards. Brand-only, no byline.
// Sets its own page title, description, canonical link and Article structured data while
// mounted (the app is a single-page app, so there is no per-route <head> to edit).

const TITLE = 'Officers’ Due Diligence and Psychosocial Hazards | Humanora'
const DESCRIPTION =
  'What the officer duty in WHS law means for psychosocial hazards, the six elements of due diligence, and the records that show you took reasonable steps.'
const PATH = '/articles/officers-due-diligence-psychosocial-hazards'

const GAP_CHECK = '/gap-check?utm_source=article&utm_medium=seo&utm_campaign=articles&utm_content=officers'

export function ArticleOfficers() {
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
      headline: 'What officers must do about psychosocial hazards',
      description: DESCRIPTION,
      dateModified: '2026-11-20',
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
            <Landmark size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">What officers must do about psychosocial hazards</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 20 November 2026. General information only, not legal advice.
        </p>

        <Card className="mt-6 border-accent/30 bg-accent/5">
          <p className="text-sm text-muted">
            <strong className="text-ink">Rules differ by jurisdiction.</strong> Each state and territory has its own WHS regulator, and each regulator publishes its own codes of practice and regulations. Most are based on the Safe Work Australia model laws, but they are not identical, and Victoria and Western Australia run their own frameworks. This article uses the model Work Health and Safety Act as a common reference. Always check the law and guidance that apply where you operate. Our{' '}
            <Link to="/guides" className="text-accent hover:underline">state and territory guides</Link> link to each regulator’s material.
          </p>
        </Card>

        <p className="mt-6 text-lg text-muted">
          Directors, CEOs and senior executives often assume psychosocial risk belongs to HR. Under WHS law it also belongs to them. Officers have their own duty, separate from the organisation’s, and it covers psychosocial hazards in the same way it covers machinery or chemicals.
        </p>
        <p className="mt-4 text-muted">
          This article explains what that duty requires, what due diligence looks like for psychosocial risk, and which records show an officer took reasonable steps.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">The officer duty in one paragraph</h2>
        <p className="mt-3 text-muted">
          Under section 27 of the model Work Health and Safety Act, if a business (a “person conducting a business or undertaking”, or PCBU) has a duty under WHS law, each of its officers must exercise due diligence to ensure the business complies. The duty is proactive and personal. It is a duty in its own right, and an officer can be prosecuted for failing to meet it even if no one has been harmed. Officers who are volunteers cannot be prosecuted for it. Victoria has its own Occupational Health and Safety Act with its own officer provisions, so Victorian officers should check the current text and WorkSafe Victoria guidance.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What “due diligence” includes</h2>
        <p className="mt-3 text-muted">
          The model Act lists six reasonable steps. The list is not exhaustive, and taking all six does not guarantee compliance. For psychosocial hazards, each one has a practical meaning.
        </p>
        <ol className="mt-4 list-decimal space-y-4 pl-6 text-muted">
          <li>
            <strong className="text-ink">Keep your knowledge up to date.</strong> Know what psychosocial hazards are, for example high job demands, low job control, poor support, harassment, violence and aggression, and poor management of organisational change. Know the codes and regulations that apply in your jurisdiction. Each regulator publishes its own.
          </li>
          <li>
            <strong className="text-ink">Understand the operations and their hazards.</strong> Know which parts of the business carry the most psychosocial risk. A call centre, a hospital ward, a construction site and a school each look different. Officers should be able to say where the highest risks are and why.
          </li>
          <li>
            <strong className="text-ink">Make sure resources and processes exist, and are used.</strong> Someone must be resourced to identify and assess psychosocial hazards, choose controls and review them. A policy on a shared drive is not a process. A process produces records.
          </li>
          <li>
            <strong className="text-ink">Make sure there is a way to receive and act on information.</strong> Incident reports, complaints, survey results, absence data and worker feedback should reach someone who can act, and be acted on in a timely way.
          </li>
          <li>
            <strong className="text-ink">Make sure the business has and implements processes to comply.</strong> This includes consulting workers, training managers and supervisors, and notifying regulators where required.
          </li>
          <li>
            <strong className="text-ink">Verify.</strong> Officers must check that steps 3 to 5 are happening, not assume it. This is where psychosocial risk most often falls short: the policy exists, but no one has confirmed it is working.
          </li>
        </ol>

        <h2 className="mt-10 font-serif text-2xl text-ink">What this looks like in practice</h2>
        <p className="mt-3 text-muted">
          For each element, ask what you could show a regulator, an auditor or your own board if asked.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-ink">
                <th className="py-2 pr-4 font-semibold">Element</th>
                <th className="py-2 pr-4 font-semibold">A question an officer should be able to answer</th>
                <th className="py-2 font-semibold">Evidence that answers it</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-border align-top">
                <td className="py-3 pr-4 font-medium text-ink">Knowledge</td>
                <td className="py-3 pr-4">Which psychosocial rules apply to us, and when did we last update our understanding?</td>
                <td className="py-3">Board or committee briefings, training records</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="py-3 pr-4 font-medium text-ink">Operations</td>
                <td className="py-3 pr-4">Where is our highest psychosocial risk?</td>
                <td className="py-3">A hazard register with ratings by work area</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="py-3 pr-4 font-medium text-ink">Resources and processes</td>
                <td className="py-3 pr-4">Who runs the process, and what do they have to do it?</td>
                <td className="py-3">Named owners, budget, scheduled assessments</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="py-3 pr-4 font-medium text-ink">Information</td>
                <td className="py-3 pr-4">How do reports and feedback reach decision makers?</td>
                <td className="py-3">Reporting lines, action logs showing follow-up</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="py-3 pr-4 font-medium text-ink">Compliance processes</td>
                <td className="py-3 pr-4">How are workers consulted?</td>
                <td className="py-3">A consultation record: who was asked, what they said, what changed</td>
              </tr>
              <tr className="align-top">
                <td className="py-3 pr-4 font-medium text-ink">Verification</td>
                <td className="py-3 pr-4">How do we know controls are working?</td>
                <td className="py-3">Review dates, re-rated residual risk, management reports</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-muted">
          The pattern is the same each time. The officer does not have to do the work personally, but must be able to show it is being done and checked.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">The common gap: no proof it was checked</h2>
        <p className="mt-3 text-muted">
          Many organisations have good intentions and some activity: a wellbeing program, an engagement survey, a harassment policy. What is often missing is a single record that shows the whole chain, from hazard identified, to risk rated, to controls chosen, to workers consulted, to review date. Without it, an officer has difficulty showing that due diligence was exercised, even if a lot was done.
        </p>
        <p className="mt-3 text-muted">
          A useful test: if a regulator asked tomorrow, could you hand over one record for each significant psychosocial hazard that shows who identified it, how it was rated, what controls were chosen and why, who was consulted, who owns each action, and when it will next be reviewed?
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">A short checklist for officers</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li>Do we have a current list of psychosocial hazards by work area, with ratings?</li>
          <li>For each high rating, is there a recommended control chosen, an owner and a due date?</li>
          <li>Have workers been consulted, and is that recorded?</li>
          <li>Is there a scheduled review, and what triggers an earlier one (an incident, a restructure, a complaint)?</li>
          <li>Does management reporting to the board or executive include psychosocial risk, with evidence of follow-through?</li>
          <li>Is the record kept in a form that cannot be quietly changed after the fact?</li>
        </ul>

        <h2 className="mt-10 font-serif text-2xl text-ink">Where Humanora fits</h2>
        <p className="mt-3 text-muted">
          Humanora is built around this chain. It gives teams a hazard library with recommended controls as a guide, risk rating, action plans with named owners, a consultation log, reassessment reminders and a management-ready report. When an assessment is finished it can be sealed, so the record shows it has not changed since it was closed. It does not replace legal advice or the judgement of the people responsible.
        </p>

        <Card className="mt-8 border-accent/30 bg-accent/5">
          <h3 className="font-serif text-lg text-ink">Check where your evidence is thin</h3>
          <p className="mt-1 text-sm text-muted">
            Our free three-minute Gap Check asks a few questions and shows the legislation for your state. No login needed.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => navigate(GAP_CHECK)} className="px-5 py-2.5">
              Run the free Gap Check <ArrowRight size={16} />
            </Button>
          </div>
        </Card>

        <p className="mt-6 text-sm italic text-muted">
          This article is general information about WHS duties and is not legal advice. Duties, penalties and guidance differ between jurisdictions and change over time. Check the current legislation and your regulator’s guidance, and seek legal advice for your situation.
        </p>

        <div className="mt-12 border-t border-border pt-6">
          <h2 className="font-serif text-xl text-ink">Sources</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-muted">
            <li>Comcare: Regulatory guide, Duties of officers (section 27 of the Work Health and Safety Act)</li>
            <li>Safe Work Australia: Model Code of Practice, Managing psychosocial hazards at work</li>
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
