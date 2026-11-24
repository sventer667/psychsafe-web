import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, ListChecks } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public article: Victoria’s psychological health regulations: what to do, and what to keep. Brand-only, no byline.
// Sets its own page title, description, canonical link and Article structured data while
// mounted (the app is a single-page app, so there is no per-route <head> to edit).

const TITLE = 'Victoria’s Psychological Health Regulations: What to Do and What to Keep | Humanora'
const DESCRIPTION =
  'Victorian employers have specific psychological health duties. What the Regulations ask for, an illustrated example of a review, and the record to keep.'
const PATH = '/articles/victoria-psychological-health-regulations-checklist'

const GAP_CHECK = '/gap-check?utm_source=article&utm_medium=seo&utm_campaign=articles&utm_content=vic-checklist'

export function ArticleVictoriaChecklist() {
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
      headline: 'Victoria’s psychological health regulations: what to do, and what to keep',
      description: DESCRIPTION,
      dateModified: '2026-11-24',
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
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Victoria’s psychological health regulations: what to do, and what to keep</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 24 November 2026. General information only, not legal advice.
        </p>

        <p className="mt-6 text-lg text-muted">
          Since 1 December 2025, Victorian employers have had to manage psychosocial hazards under the Occupational Health and Safety (Psychological Health) Regulations 2025. These are factors in how work is designed and managed that can harm people’s mental health, such as unmanageable workloads, bullying, aggression or harassment.
        </p>
        <p className="mt-4 text-muted">
          The rules are not hard to understand. They ask four things of you: identify the hazards, control the risks, review your controls when things change, and consult your employees. The hard part comes later, when someone asks you to show that you did them. This article walks through the four duties, shows what a review looks like in practice, and explains what to keep.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">The four duties</h2>
        <p className="mt-3 text-muted">
          <strong className="text-ink">Identify hazards.</strong> Find anything in your workplace that could harm psychological health. WorkSafe Victoria’s Psychological Health Compliance Code gives 16 examples, including high job demands, low job control, bullying, sexual harassment and gendered violence, and aggression or violence. Be specific about where the hazard shows up. “High job demands” only names a category. “High job demands in the intake team at month end” tells you who is affected and when, which is what you need to decide what to change.
        </p>
        <p className="mt-3 text-muted">
          <strong className="text-ink">Control the risks.</strong> Ask first whether you can eliminate the risk so far as is reasonably practicable. If not, reduce it so far as is reasonably practicable. The Victorian rules list how: by changing the management of work, the plant, the systems of work, the work design or the workplace environment; by using information, instruction or training; or by combining these.
        </p>
        <p className="mt-3 text-muted">
          <strong className="text-ink">Review and revise.</strong> You must go back over your controls when the risk may have changed. WorkSafe’s guidance gives these triggers, among others: new information about a hazard, a report of a psychological injury or hazard from an employee or someone acting for them, a notifiable incident involving a psychosocial hazard, a planned change to equipment, a process or a system of work that is likely to change the risks, and a request from a health and safety representative.
        </p>
        <p className="mt-3 text-muted">
          <strong className="text-ink">Consult.</strong> So far as is reasonably practicable, consult employees on health and safety matters that affect them. If a health and safety representative represents them, the consultation must involve that representative. The duty also reaches independent contractors you engage, for matters you control.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">The rule we think trips plans up first</h2>
        <p className="mt-3 text-muted">
          Information, instruction and training can be your sole control only where nothing else is reasonably practicable. And when you use a combination of controls, training must not be the main part of it.
        </p>
        <p className="mt-3 text-muted">
          When a hazard is uncomfortable, the quickest response is a session, a poster or a policy. A plan built mostly from those would not meet the rule, unless nothing else is reasonably practicable. If your controls are mainly about telling people things, go back and ask what in the work itself could change.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What a review looks like: an illustration</h2>
        <p className="mt-3 text-sm italic text-muted">
          This example is made up, to show the process. It is not a real customer.
        </p>
        <p className="mt-3 text-muted">
          A 60-person logistics company in Melbourne runs dispatch across two shifts. One evening a dispatcher tells their supervisor that back-to-back late shifts have left them exhausted and struggling to cope.
        </p>
        <p className="mt-3 text-muted">
          A report like this is one of the triggers WorkSafe lists, so the company acts on it. The supervisor records the date and what was said, and the hazard goes into the register as work-related fatigue in the dispatch team.
        </p>
        <p className="mt-3 text-muted">
          The first question is whether the risk can be eliminated. Probably not entirely, since dispatch has to run at night. So the company looks at changes to the work: a roster that limits consecutive late shifts, and extra cover at peak periods. These change the systems of work. A short briefing on managing fatigue is added, but only as a support, not the main control.
        </p>
        <p className="mt-3 text-muted">
          Before settling the roster, the manager consults the dispatchers and their health and safety representative, and notes what they said, including that one proposed pattern would make childcare impossible. The roster is adjusted. Each action gets an owner and a date, and a review is set for three months later.
        </p>
        <p className="mt-3 text-muted">
          Months afterwards, someone asks how the company handled fatigue in dispatch. The answer is on one record: the report, the rating, the controls and why they were chosen, who was consulted, who did what, and when it was reviewed.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What to keep</h2>
        <p className="mt-3 text-muted">
          For each significant hazard, keep one record that shows the hazard and where it occurs, how it was rated, the controls chosen and the reasoning, who was consulted and what they said, who owns each action and by when, and the date and trigger of each review. A written prevention plan is not mandatory in Victoria, though WorkSafe encourages its template. An employer who follows the Compliance Code is taken to have complied with the duties it covers.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">How Humanora helps</h2>
        <p className="mt-3 text-muted">
          Humanora is built around that single record. You add hazards to an assessment from a built-in library and rate them. If you set the assessment’s state to Victoria, the legislation references in your Risk Register and PDF report cite the Occupational Health and Safety Act 2004 and the Psychological Health Regulations 2025.
        </p>
        <p className="mt-3 text-muted">
          Each library hazard comes with recommended controls, shown in order from changing the work itself through to individual support. They are a guide, and you decide what suits your workplace. Use the order as a prompt to check you are not leaning mainly on training. Controls become actions on the Action Items tab, each with a named owner and due date, and the dashboard shows what is overdue.
        </p>
        <p className="mt-3 text-muted">
          You record consultation on the Consultation Log tab: the date, method, who attended (including your health and safety representative, if you have one) and a summary. You set how often to reassess, and Humanora shows when a review is due. When a trigger like the one above occurs on an assessment that has already been sealed, you reopen it and record why, so the history shows what prompted the review. When the assessment is finished, export the management report from the Report tab and seal it on the Overview tab. Sealing stores a cryptographic fingerprint and an independent timestamp, so you can show the record has not changed since it was closed.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What to do next</h2>
        <p className="mt-3 text-muted">
          If you want to see where your records stand, the free three-minute{' '}
          <Link to="/gap-check" className="text-accent hover:underline">Gap Check</Link> asks a few questions and shows the legislation for your state. To test the process on one real hazard, you can start a free 7-day trial and take a single assessment from start to finish. Our{' '}
          <Link to="/guides/victoria-psychosocial-hazards" className="text-accent hover:underline">Victoria employer guide</Link> covers the rules in plain language.
        </p>

        <Card className="mt-8 border-accent/30 bg-accent/5">
          <h3 className="font-serif text-lg text-ink">See where your records stand</h3>
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
          This article is general information, not legal advice, and Humanora does not decide what is reasonably practicable for your workplace. Check the current regulations and WorkSafe Victoria guidance, and take advice for your situation.
        </p>
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
