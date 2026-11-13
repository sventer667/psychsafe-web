import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public index of blog posts. Sets its own page
// title, description and canonical link while mounted (the app is a single-page app,
// so there is no per-route <head> to edit).

const TITLE = 'Blog | Humanora'
const DESCRIPTION =
  'Practical articles on managing psychosocial hazards at work in Australia, from the Humanora team.'
const PATH = '/blog'

const GAP_CHECK = '/gap-check?utm_source=blog&utm_medium=seo&utm_campaign=blog&utm_content=blog'

const POSTS: { title: string; summary: string; path: string }[] = [
  {
    title: 'How often should you review psychosocial controls?',
    summary: 'The model code says to review controls regularly and lists when a review is required. How to turn that into a schedule.',
    path: '/articles/how-often-to-review-psychosocial-controls',
  },
  {
    title: 'Psychosocial hazards at work: four examples and the controls that fit them',
    summary: 'Four common psychosocial hazards, what they look like at work, and example controls from the model code.',
    path: '/articles/psychosocial-hazard-examples-and-controls',
  },
  {
    title: 'Psychosocial risk assessment: the four steps, with a worked example',
    summary: 'The four steps of managing psychosocial risk under the model code, illustrated with a council service counter.',
    path: '/articles/psychosocial-risk-assessment-four-steps',
  },
  {
    title: 'How to record worker consultation on psychosocial hazards',
    summary: 'What consultation has to involve, and how to record who was asked, what they said and what you did about it.',
    path: '/articles/recording-worker-consultation-psychosocial-hazards',
  },
  {
    title: 'What a psychosocial risk register should contain',
    summary: 'What to put in a register, column by column, with a short worked entry and the mistakes that make one useless in a review.',
    path: '/articles/psychosocial-risk-register',
  },
]

export function Blog() {
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

    return () => {
      document.title = prevTitle
      if (createdMeta) meta?.remove()
      else if (prevDesc !== null) meta?.setAttribute('content', prevDesc)
      canonical.remove()
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
            <BookOpen size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Blog</h1>
        </div>

        <p className="mt-6 text-lg text-muted">
          Practical articles on managing psychosocial hazards at work in Australia. For rules in your state or territory,
          see our <Link to="/guides" className="text-accent hover:underline">state and territory guides</Link>.
        </p>
        <p className="mt-4 text-sm italic text-muted">
          General information only, not legal advice. Always check the current legislation and your regulator’s guidance.
        </p>

        <ul className="mt-8 space-y-3">
          {POSTS.map((p) => (
            <li key={p.path}>
              <Link
                to={p.path}
                className="block rounded-xl border border-border bg-surface px-5 py-4 hover:border-accent"
              >
                <span className="font-serif text-lg text-ink">{p.title}</span>
                <span className="mt-1 block text-sm text-muted">{p.summary}</span>
              </Link>
            </li>
          ))}
        </ul>

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
      </article>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Humanora" className="h-6 w-6 object-contain" />
            <span>© {new Date().getFullYear()} Humanora</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/guides" className="hover:text-ink">Guides</Link>
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
