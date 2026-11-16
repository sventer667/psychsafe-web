import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input, Label, Select, Textarea } from '../components/ui/Input'
import { api, ApiError } from '../lib/api'
import logo from '../assets/humanora-logo.png'

// Public index of blog posts. Sets its own page
// title, description and canonical link while mounted (the app is a single-page app,
// so there is no per-route <head> to edit).

const TITLE = 'Contact and Support | Humanora'
const DESCRIPTION =
  'Contact Humanora for sales enquiries, account help, billing, privacy requests and support. Tell us what you need and we will reply by email.'
const PATH = '/contact'

const WHO = ['An existing Humanora client', 'Considering Humanora', 'Other']
const TOPICS = [
  'Sales enquiry or demo request',
  'Signing in or password reset',
  'Two-factor authentication',
  'Team members and seats',
  'Subscription and billing',
  'Assessments and reports',
  'Sealing or reopening an assessment',
  'Hazard library or legislation content',
  'Privacy or data request',
  'Security concern',
  'Something else',
]
const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT', 'Multiple']
const MAX = 2000

export function Contact() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [who, setWho] = useState('')
  const [topic, setTopic] = useState('')
  const [state, setState] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api('/contact', { method: 'POST', body: { name, email, organisation, who, topic, state, message, website } })
      setSentTo(email)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again, or email contact@humanora.com.au.')
    } finally {
      setBusy(false)
    }
  }

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
            <MessageSquare size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Contact and Support</h1>
        </div>

        <p className="mt-6 text-lg text-muted">
          Tell us what you need help with and we will reply by email. For answers to common questions, see our{' '}
          <Link to="/help" className="text-accent hover:underline">Help</Link> page.
        </p>

        {sentTo ? (
          <Card className="mt-8 border-accent/30 bg-accent/5">
            <h2 className="font-serif text-lg text-ink">Thank you</h2>
            <p className="mt-2 text-sm text-muted">
              We have received your message and will reply to {sentTo} within 1 to 3 business days. See our{' '}
              <Link to="/support" className="text-accent hover:underline">Support Policy</Link> for response times by priority.
            </p>
          </Card>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-name">Your name *</Label>
                <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="c-email">Work email *</Label>
                <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} autoComplete="email" />
              </div>
            </div>

            <div>
              <Label htmlFor="c-org">Organisation</Label>
              <Input id="c-org" value={organisation} onChange={(e) => setOrganisation(e.target.value)} maxLength={200} autoComplete="organization" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-who">I am *</Label>
                <Select id="c-who" value={who} onChange={(e) => setWho(e.target.value)} required>
                  <option value="">Choose one</option>
                  {WHO.map((w) => <option key={w} value={w}>{w}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="c-state">State or territory</Label>
                <Select id="c-state" value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Choose one (optional)</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="c-topic">What do you need help with? *</Label>
              <Select id="c-topic" value={topic} onChange={(e) => setTopic(e.target.value)} required>
                <option value="">Choose one</option>
                {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>

            <div>
              <Label htmlFor="c-message">Message *</Label>
              <Textarea id="c-message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={MAX} />
              <p className="mt-1 text-xs text-muted">
                Please do not include passwords, two-factor codes or payment card details. {message.length}/{MAX}
              </p>
            </div>

            {/* Spam trap: hidden from people, filled in by bots. */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label>Leave this field empty<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={busy} className="px-5 py-2.5">
              {busy ? 'Sending…' : 'Send message'}
            </Button>
            <p className="text-xs text-muted">
              We use your details only to reply to you. See our <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        )}
      </article>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Humanora" className="h-6 w-6 object-contain" />
            <span>© {new Date().getFullYear()} Humanora</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/guides" className="hover:text-ink">Guides</Link>
            <Link to="/blog" className="hover:text-ink">Blog</Link>
            <Link to="/legal" className="hover:text-ink">Legal</Link>
            <Link to="/privacy" className="hover:text-ink">Privacy</Link>
            <Link to="/terms" className="hover:text-ink">Terms</Link>
            <Link to="/help" className="hover:text-ink">Help</Link>
            <Link to="/help" className="hover:text-ink">Help</Link>
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
