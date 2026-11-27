import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, ListChecks } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public article: getting actions done in Humanora. Brand-only, no byline.
// Sets its own page title, description, canonical link and Article structured data while
// mounted (the app is a single-page app, so there is no per-route <head> to edit).

const TITLE = 'Making Psychosocial Actions Get Done in Humanora | Humanora'
const DESCRIPTION =
  'How Humanora keeps actions from stalling: a named owner, a due date, a clear status, overdue flags in the action list, and a personal reminder on each owner’s dashboard.'
const PATH = '/articles/psychosocial-actions-owners-due-dates-humanora'

const SIGNUP = '/signup?utm_source=article&utm_medium=seo&utm_campaign=articles&utm_content=actions-done'

function Shot({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <figure className="mt-5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge screenshot: ${alt}`}
        className="group relative block w-full cursor-zoom-in"
      >
        <img src={src} alt={alt} width={1200} height={499} loading="lazy" className="w-full rounded-xl border border-border" />
        <span className="absolute bottom-2 right-2 rounded-md bg-ink/80 px-2 py-1 text-xs text-white opacity-90 group-hover:opacity-100">
          Click to enlarge
        </span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-start justify-center overflow-auto bg-black/85 p-4 sm:items-center"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="fixed right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-medium text-ink shadow"
          >
            Close ✕
          </button>
          <img
            src={src}
            alt={alt}
            style={{ width: 'min(1200px, 100%)', minWidth: '900px', maxWidth: 'none' }}
            className="rounded-lg"
          />
        </div>
      )}
    </figure>
  )
}

export function ArticleActionsDone() {
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
      headline: 'Making psychosocial actions get done in Humanora',
      description: DESCRIPTION,
      dateModified: '2026-11-27',
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
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Making psychosocial actions get done in Humanora</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 27 November 2026. General information only, not legal advice.
        </p>

        <p className="mt-6 text-lg text-muted">
          Most risk registers don’t fail at the assessment. They fail six weeks later, when an action that everyone agreed on has quietly gone nowhere.
        </p>
        <p className="mt-4 text-muted">
          Humanora is built around that gap. This is how it works, step by step.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Every action needs a person and a date</h2>
        <p className="mt-3 text-muted">
          On the Action Items tab, a new action has a title, an optional description, an owner, a due date and a linked hazard.
        </p>
        <Shot src="/screens/05-action-owner-due-date.jpg" alt="The new action form, with title, description, owner, due date and linked hazard" />
        <p className="mt-4 text-muted">
          The owner comes from a list of your team. You can’t type in a name, so every action belongs to someone who actually has an account. That’s deliberate. It’s much harder for a job to belong to “the team” when it has to belong to a named person.
        </p>
        <p className="mt-3 text-muted">
          Each action links to one hazard. If a control covers two hazards, you add it once for each. It’s a small bit of repetition, and it means each hazard’s record shows exactly what was done about it.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">A status that says where it is</h2>
        <p className="mt-3 text-muted">
          Every action has a status: Not started, Underway, Awaiting sign-off, Done or Closed out. You change it from the action itself.
        </p>
        <p className="mt-3 text-muted">
          “Awaiting sign-off” is there for work that someone says is finished but somebody else needs to check. It’s a useful in-between state when you want a second person to confirm a control is really in place before it counts as done.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Overdue things float to the top</h2>
        <p className="mt-3 text-muted">
          The action list is sorted so that overdue actions come first, then the rest by due date. An overdue action carries a red “Overdue” flag next to its title, so you don’t have to hunt for it.
        </p>
        <Shot src="/screens/06-action-list.jpg" alt="The action list, with two actions, their owners, a due date and a status" />
        <p className="mt-4 text-muted">
          On the dashboard, you’ll see counts of open and overdue actions across your assessments.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Owners get told, without anyone chasing</h2>
        <p className="mt-3 text-muted">
          When an owner logs in, their dashboard shows a reminder for actions assigned to them that are overdue or due within the next three days. It says how many there are and lists the first few, each linking straight to the action. It covers all of their assessments, not only the one they happen to be looking at.
        </p>
        <p className="mt-3 text-muted">
          That means the person responsible hears about it when they log in, rather than relying on someone else to remember to ask.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What it doesn’t do</h2>
        <p className="mt-3 text-muted">
          It doesn’t do the work for anyone, and it doesn’t decide what’s reasonably practicable for your workplace. What it does is make it obvious who owns what, by when, and what’s late. Whether the control is the right one is still your call.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Why this matters for the record</h2>
        <p className="mt-3 text-muted">
          When someone asks what you did about a hazard, “we agreed to roster changes” isn’t much of an answer. “The roster change was owned by this person, due on this date, and completed on this date” is. It’s also what the management report shows: actions ordered by how overdue they are, next to the hazards they relate to.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Try it on one action</h2>
        <p className="mt-3 text-muted">
          Take one control you already know you need and put it into an assessment with an owner and a date. If you want the whole process first, our article on{' '}
          <Link to="/articles/first-psychosocial-risk-assessment-humanora" className="text-accent hover:underline">your first assessment</Link> walks through each step, and{' '}
          <Link to="/articles/choosing-psychosocial-controls-humanora" className="text-accent hover:underline">choosing controls</Link> covers where the actions come from.
        </p>

        <Card className="mt-8 border-accent/30 bg-accent/5">
          <h3 className="font-serif text-lg text-ink">Start a free 7-day trial</h3>
          <p className="mt-1 text-sm text-muted">
            Run one real hazard through an assessment and see how it feels.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => navigate(SIGNUP)} className="px-5 py-2.5">
              Start free trial <ArrowRight size={16} />
            </Button>
          </div>
        </Card>

        <p className="mt-6 text-sm italic text-muted">
          This article is general information, not legal advice, and Humanora doesn’t decide what’s reasonably practicable for your workplace. The screenshots come from a made-up sample assessment. Check the current regulations and your regulator’s guidance, and take advice for your situation.
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
