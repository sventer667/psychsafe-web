import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, LifeBuoy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public index of blog posts. Sets its own page
// title, description and canonical link while mounted (the app is a single-page app,
// so there is no per-route <head> to edit).

const TITLE = 'Help | Humanora'
const DESCRIPTION =
  'Answers to common questions about Humanora accounts, subscriptions, two-factor authentication, assessments and reports, and how to contact support.'
const PATH = '/help'

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I reset my password?',
    a: 'Select "Forgot password" on the log in page and enter your account email. We will send a reset link.',
  },
  {
    q: 'How does two-factor authentication work?',
    a: 'Humanora supports authenticator-app codes. Administrator accounts are required to use two-factor authentication. You set it up on the Security page in the app.',
  },
  {
    q: 'How do I add team members?',
    a: 'Administrators can invite users from the Team page. The number of seats depends on your plan.',
  },
  {
    q: 'How do I change plan or update subscription details?',
    a: 'Open the Subscription page in the app. Payments are handled securely by Stripe. Select "Manage subscription" to change your plan or update your payment method.',
  },
  {
    q: 'How does the free trial work?',
    a: 'New accounts start with a 7-day free trial. When the trial ends, you need an active plan to keep creating and editing assessments.',
  },
  {
    q: 'How do I export an assessment report?',
    a: 'Open the assessment and go to the Report tab to generate and download a PDF report.',
  },
  {
    q: 'What does sealing an assessment do?',
    a: 'On the Overview tab, "Close & seal this assessment" records a cryptographic fingerprint and timestamp so you can show the assessment has not changed since. A sealed assessment can be reopened with a recorded reason, and the reopening is logged.',
  },
  {
    q: 'Which state or territory rules does Humanora use?',
    a: 'Each assessment uses the state or territory you select, and the legislation citations follow that choice. Each regulator publishes its own codes and regulations, so check your regulator’s current guidance.',
  },
  {
    q: 'Does Humanora provide legal advice?',
    a: 'No. Humanora is a tool to help you manage and document psychosocial risk. It does not replace legal or professional advice.',
  },
  {
    q: 'How do I report a security issue or request data deletion?',
    a: 'Email contact@humanora.com.au with the subject line "Security" or "Privacy request".',
  },
]

export function Help() {
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
            <LifeBuoy size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Help</h1>
        </div>

        <p className="mt-6 text-lg text-muted">
          Find answers to common questions below. If you can’t find what you need, use our <Link to="/contact" className="text-accent hover:underline">contact form</Link> or email us.
        </p>

        <Card className="mt-8 border-accent/30 bg-accent/5">
          <h2 className="font-serif text-lg text-ink">Contact us</h2>
          <p className="mt-2 text-sm text-muted">
            Email: <a href="mailto:contact@humanora.com.au" className="text-accent hover:underline">contact@humanora.com.au</a>
          </p>
          <p className="mt-2 text-sm text-muted">
            Support hours: Monday to Friday, 9:00 am to 5:00 pm Australian Eastern time. We aim to reply within 1 to 3
            business days, depending on the priority of your request. See our{' '}
            <Link to="/support" className="text-accent hover:underline">Support Policy</Link> for details.
          </p>
          <p className="mt-2 text-sm text-muted">
            To help us respond faster, include your organisation name, the email address on your account, and a short
            description of the issue. Please do not send passwords or payment card details.
          </p>
        </Card>

        <h2 className="mt-12 font-serif text-2xl text-ink">Frequently asked questions</h2>
        <div className="mt-4 space-y-3">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-xl border border-border bg-surface px-5 py-4">
              <h3 className="font-serif text-lg text-ink">{f.q}</h3>
              <p className="mt-1 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted">
          See also our <Link to="/legal" className="text-accent hover:underline">Legal</Link> information,{' '}
          <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link> and{' '}
          <Link to="/support" className="text-accent hover:underline">Support Policy</Link>.
        </p>
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
            <Link to="/contact" className="hover:text-ink">Contact</Link>
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
