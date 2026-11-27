import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, ListChecks } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public article: choosing controls in Humanora. Brand-only, no byline.
// Sets its own page title, description, canonical link and Article structured data while
// mounted (the app is a single-page app, so there is no per-route <head> to edit).

const TITLE = 'Choosing Psychosocial Controls in Humanora | Humanora'
const DESCRIPTION =
  'How Humanora’s suggested controls work, why they’re ordered most effective first, and how to turn the ones you pick into actions with an owner and a date.'
const PATH = '/articles/choosing-psychosocial-controls-humanora'

const SIGNUP = '/signup?utm_source=article&utm_medium=seo&utm_campaign=articles&utm_content=choosing-controls'

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

export function ArticleChoosingControls() {
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
      headline: 'Choosing psychosocial controls in Humanora',
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
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Choosing psychosocial controls in Humanora</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 27 November 2026. General information only, not legal advice.
        </p>

        <p className="mt-6 text-lg text-muted">
          Spotting a hazard is the easy part. The harder question is what you’re going to do about it, and whether you can show you thought about it properly.
        </p>
        <p className="mt-4 text-muted">
          This is how the controls side of Humanora works, and where you stay in charge.
        </p>
        <Shot src="/screens/03-hazard-library.jpg" alt="The hazard library, grouped by theme, with Fatigue listed under Job design" />

        <h2 className="mt-10 font-serif text-2xl text-ink">Every hazard comes with suggestions</h2>
        <p className="mt-3 text-muted">
          When you add a hazard from the library, it arrives with a set of suggested controls written for that hazard. They aren’t generic. Suggestions for fatigue talk about rosters and consecutive late shifts. They don’t talk about workloads or conflict.
        </p>
        <p className="mt-3 text-muted">
          They’re a starting point. You decide what fits your workplace. If the right control isn’t on the list, you can create your own action from the Action Items tab and link it to the hazard.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">The order is the point</h2>
        <p className="mt-3 text-muted">
          Open a hazard and scroll down to the recommended actions. They’re listed most effective first: eliminate, substitute, isolate, engineering or system controls, administrative controls, then individual support.
        </p>
        <Shot src="/screens/04-recommended-controls.jpg" alt="Recommended actions for Fatigue, listed from Eliminate through to Individual support, with one already added to the action items" />
        <p className="mt-4 text-muted">
          That order matters because of how the rules work. Under the Victorian regulations, information, instruction and training can’t be your main control where something better is reasonably practicable. When “redesign rosters” sits at the top of the list and “fatigue-awareness training” sits near the bottom, it’s harder to default to a training session because it’s quick.
        </p>
        <p className="mt-3 text-muted">
          It also helps when you’re writing down your reasoning. If you chose something lower on the list, you can say why the options above it weren’t reasonably practicable for you.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">One click to make it an action</h2>
        <p className="mt-3 text-muted">
          Each suggestion has an “Add to action items” link beside it. Click it and the control becomes an action on the Action Items tab. You then give it an owner from your team and a due date.
        </p>
        <p className="mt-3 text-muted">
          A control with no owner and no date is a good intention. This is the step that turns it into a job somebody has to do.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Log what you already do</h2>
        <p className="mt-3 text-muted">
          Before you add anything new, record the controls you already have, and rate how well each one works. Many workplaces find they’re already doing more than they thought, and that a couple of those controls aren’t doing much. That’s useful to know before you spend time on new ones.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Why residual risk waits</h2>
        <p className="mt-3 text-muted">
          Once you’ve acted, you can re-rate the hazard to show the risk that’s left. Humanora only lets you do that once a linked action is marked complete. It stops anyone from scoring a control that only exists on paper.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Try it on one hazard</h2>
        <p className="mt-3 text-muted">
          Pick one hazard that’s already on your mind, add it from the library, and look at the suggestions. If you want to see the full walk-through first, our article on{' '}
          <Link to="/articles/first-psychosocial-risk-assessment-humanora" className="text-accent hover:underline">your first assessment</Link> covers every step. Or take the three-minute{' '}
          <Link to="/gap-check" className="text-accent hover:underline">Gap Check</Link> to see where your records stand.
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
