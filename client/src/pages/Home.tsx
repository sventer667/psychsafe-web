import { useNavigate, Navigate } from 'react-router-dom'
import {
  ClipboardList,
  ShieldCheck,
  FileLock2,
  Users,
  MapPin,
  FileOutput,
  ArrowRight,
  Check,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public marketing page, the front door for visitors who aren't signed in
// yet. Deliberately its own layout (not the in-app Topbar/Layout), since it
// needs a nav with Login/Sign up instead of the app's Dashboard/Cases/Team/
// Billing links. Original copy and layout, not adapted from any other site.

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Hazard register with a built-in library',
    description:
      'Pull from a reference library of psychosocial hazards aligned to Safe Work Australia\'s model, rate them with plain-English descriptions instead of a raw 1-5 scale, and get a staged pathway of controls for each one.',
  },
  {
    icon: MapPin,
    title: 'State-aware legislation citations',
    description:
      'Every assessment carries its own state or territory, so an organisation with sites in more than one state gets the right WHS regulation and code-of-practice citation for each site, not a generic national summary.',
  },
  {
    icon: ShieldCheck,
    title: 'Action plans that track themselves',
    description:
      'Turn a recommended control into an action item in one click, assign an owner and due date, and let overdue items surface automatically instead of getting lost in a spreadsheet.',
  },
  {
    icon: Users,
    title: 'Worker consultation, logged properly',
    description:
      'Record consultation dates, methods, attendees, and outcomes against the assessment they relate to, so you can show the legislated consultation requirement was actually met.',
  },
  {
    icon: FileLock2,
    title: 'Cryptographic sealing',
    description:
      'When an assessment is closed, every hazard, action, and consultation entry is locked in with Secure Hash Algorithms and stamped through an independent RFC 3161 time stamp authority, giving anyone reviewing it later a way to confirm both its contents and its closing time.',
  },
  {
    icon: FileOutput,
    title: 'Management ready PDF export',
    description:
      'One click produces a report with a risk-level chart, an action plan ordered by urgency, the consultation log, and a compliance reference section, ready to hand to a board or regulator.',
  },
]

const STEPS = [
  { title: 'Create your organisation', description: 'Sign up, and you\'re in, no sales call required to start your 7-day free trial.' },
  { title: 'Set your state and industry', description: 'A short profile drives which legislation citations show up everywhere else.' },
  { title: 'Run the assessment', description: 'Add hazards from the library, rate them, assign actions, and log consultations as you go.' },
  { title: 'Export and seal', description: 'Download a management-ready PDF, then close the assessment to lock in a verifiable, tamper-evident seal.' },
]

const TIERS = [
  {
    label: 'Starter',
    price: '$89',
    seats: '1 seat',
    blurb: 'A single person running one assessment at a time.',
    features: ['Full hazard register & action plans', 'Management ready PDF export', 'Tamper-evident assessment sealing'],
  },
  {
    label: 'Growth',
    price: '$179',
    seats: 'Up to 3 seats',
    blurb: 'A WHS/HR team collaborating across assessments.',
    features: ['Everything in Starter', 'Unlimited assessments', 'Priority email support'],
    highlighted: true,
  },
  {
    label: 'Enterprise',
    price: '$399',
    seats: 'Up to 10 seats',
    blurb: 'A larger organisation with a dedicated WHS function.',
    features: ['Everything in Growth', 'Dedicated onboarding', 'Priority support SLA'],
  },
]

export function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // A signed-in visitor landing on "/" belongs in the app, not the pitch. Wait
  // for the auth check to resolve before deciding, so an already-logged-in
  // visitor doesn't see a flash of marketing copy before being redirected.
  if (loading) return <div className="min-h-screen bg-canvas" />
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="bg-canvas">
      <header className="sticky top-0 z-10 bg-navy">
        <div className="h-[3px] bg-gradient-to-r from-accent via-accent to-navy" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            
            <div className="font-serif text-lg font-semibold text-navy-contrast">Humanora</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-navy-contrast/80 hover:text-navy-contrast">
              Log in
            </button>
            <Button onClick={() => navigate('/signup')}>Start free trial</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <img src={logo} alt="Humanora" className="mx-auto mb-8 h-16 w-auto sm:h-20" />
<h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
          Psychosocial risk management
        </h1><h2 className="mx-auto mt-4 max-w-3xl font-serif text-xl text-ink sm:text-2xl">Identify and manage the Psychosocial risks in your organisation.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Humanora is a self-serve system of record for psychosocial workplace risk. It's built for any
          organisation that needs to assess hazards, manage controls and keep a defensible record.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => navigate('/signup')} className="px-6 py-3 text-base">
            Start your free 7-day trial <ArrowRight size={18} />
          </Button>
          <Button variant="secondary" onClick={() => navigate('/login')} className="px-6 py-3 text-base">
            Log in
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted">No credit card required to start.</p>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-2xl text-ink sm:text-3xl">Everything one assessment needs</h2>
            <p className="mt-3 text-muted">
              Built specifically for Australian workplace psychosocial hazards, not adapted from a generic risk tool.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <f.icon size={22} className="text-accent" />
                <h3 className="mt-3 font-serif text-base text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-2xl text-ink sm:text-3xl">From sign-up to sealed report</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 font-serif text-sm text-accent">
                  {i + 1}
                </div>
                <h3 className="mt-3 font-serif text-base text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-2xl text-ink sm:text-3xl">Simple, per-seat pricing</h2>
            <p className="mt-3 text-muted">Every plan includes the full hazard register, action plans, and sealed PDF export.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.label}
                className={`flex flex-col rounded-2xl border p-6 ${t.highlighted ? 'border-accent bg-accent/5' : 'border-border bg-canvas'}`}
              >
                <div className="font-serif text-lg text-ink">{t.label}</div>
                <div className="mt-1 font-serif text-3xl text-ink">
                  {t.price}
                  <span className="text-base font-normal text-muted">/mo</span>
                </div>
                <div className="mt-1 text-xs text-muted">{t.seats}</div>
                <p className="mt-3 text-sm text-muted">{t.blurb}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink">
                      <Check size={14} className="mt-0.5 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={t.highlighted ? 'primary' : 'secondary'}
                  className="mt-5 w-full"
                  onClick={() => navigate('/signup')}
                >
                  Start free trial
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-navy py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-serif text-2xl text-navy-contrast sm:text-3xl">Ready to run your first assessment?</h2>
          <p className="mt-3 text-navy-contrast/70">Start your free 7-day trial, no credit card required.</p>
          <Button onClick={() => navigate('/signup')} className="mt-6 px-6 py-3 text-base">
            Start free trial <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            
            <span>© {new Date().getFullYear()} Humanora</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="hover:text-ink">Log in</button>
            <button onClick={() => navigate('/signup')} className="hover:text-ink">Sign up</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
