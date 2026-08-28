import { useNavigate, Link } from 'react-router-dom'
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
import { SECTORS } from '../lib/sectors'
import logo from '../assets/connexus-logo.png'
import heroImage from '../assets/hero-meeting.jpg'

// Public marketing page, the front door for visitors who aren't signed in
// yet. Deliberately its own layout (not the in-app Topbar/Layout), since it
// needs a nav with Login/Sign up instead of the app's Dashboard/Cases/Team/
// Billing links. Original copy and layout, not adapted from any other site.

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Hazard register with a built-in library',
    description:
      'Pull from a reference library of psychosocial hazards aligned to state regulators'\n codes of practice, rate them with plain-English descriptions instead of a raw 1-5 scale, and get a staged pathway of controls for each one.',
  },
  {
    icon: MapPin,
    title: 'State-aware legislation citations',
    description:
      'Every assessment carries its own state or territory, so an organisation with sites in more than one state gets the right WHS regulation and code-of-practice citation for each site, not a generic national summary.',
  },
  {
    icon: ShieldCheck,
    title: 'Action plans with automatic overdue flags',
    description:
      'Turn a recommended control into an action item in one click, assign an owner and due date, and see overdue items flagged automatically instead of getting lost in a spreadsheet.',
  },
  {
    icon: Users,
    title: 'Worker consultation, logged properly',
    description:
      'Record consultation dates, methods, attendees, and outcomes against the assessment they relate to, giving you a clear record that the legislated consultation requirement was met.',
  },
  {
    icon: FileLock2,
    title: 'Tamper-evident sealing',
    description:
      'Closing an assessment locks the hazard register, action plan, and consultation log together, generates a SHA-256 fingerprint of the record, and certifies the time with an independent RFC 3161 authority.',
  },
  {
    icon: FileOutput,
    title: 'One-click compliance report',
    description:
      'One click produces a report with a risk-level chart, an action plan ordered by urgency, the consultation log, and a compliance reference section, formatted for a board pack or regulator request.',
  },
]

const STEPS = [
  { title: 'Create your organisation', description: 'Sign up, and you\\'re in, no sales call required to start your 7-day free trial.' },
  { title: 'Set your state and industry', description: 'A short profile drives which legislation citations show up everywhere else.' },
  { title: 'Run the assessment', description: 'Add hazards from the library, rate them, assign actions, and log consultations as you go.' },
  { title: 'Export and seal', description: 'Download a formatted PDF report, then close and seal the record with a verifiable timestamp.' },
]

const TIERS = [
  {
    label: 'Starter',
    price: '$89',
    seats: '1 seat',
    blurb: 'A single person running one assessment at a time.',
    features: ['Full hazard register & action plans', 'One-click compliance report', 'Cryptographic assessment sealing'],
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
    price: '$599',
    seats: 'Up to 10 seats',
    blurb: 'A larger organisation with a dedicated WHS function.',
    features: ['Everything in Growth', 'Dedicated onboarding', 'Priority support SLA'],
  },
]

export function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // A signed-in visitor can still browse the public site (e.g. via the "Home"
  // link in the app's top bar), so this page no longer force-redirects them.
  // It just swaps the login/signup prompts for a straight link back into the
  // app, so there's always a way back either direction.
  if (loading) return <div className="min-h-screen bg-canvas" />

  return (
    <div className="bg-canvas">
      <header className="sticky top-0 z-10 bg-navy">
        <div className="h-[3px] bg-gradient-to-r from-accent via-accent to-navy" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Connexus" className="h-8 w-8 object-contain" />
            <div className="font-serif text-lg font-semibold text-navy-contrast">Connexus</div>
          </div>
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

      {/* Hero: dark navy band, continuous with the header above it, for
          more visual weight than a plain white hero. */}
      <section className="bg-navy py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                Built for Australian workplaces managing psychosocial risk
              </p>
              <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-navy-contrast sm:text-5xl">
                Reduce psychosocial risk before it escalates.
              </h1>
              <p className="mt-5 text-lg font-normal text-navy-contrast/70">
                Log hazards, assign controls, and record consultation in one place, with the right WHS citation applied
                automatically for wherever in Australia you operate.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {user ? (
                  <Button onClick={() => navigate('/dashboard')} className="px-6 py-3 text-base">
                    Go to dashboard <ArrowRight size={18} />
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => navigate('/signup')} className="px-6 py-3 text-base">
                      Start your free 7-day trial <ArrowRight size={18} />
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/login')} className="px-6 py-3 text-base">
                      Log in
                    </Button>
                  </>
                )}
              </div>
              {!user && <p className="mt-4 text-sm text-navy-contrast/60">No credit card required to start.</p>}
            </div>

            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-lg shadow-black/40">
              <img
                src={heroImage}
                alt="A WHS and HR team reviewing a psychosocial risk assessment together"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
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

      {/* Sector-specific guidance */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-2xl text-ink sm:text-3xl">How this looks in your industry</h2>
            <p className="mt-3 text-muted">
              Psychosocial hazards show up differently depending on what your business does. Pick your sector to see
              the hazards that turn up most often there, and the WHS rules that apply.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTORS.map((s) => (
              <Link key={s.slug} to={`/sectors/${s.slug}`} className="block">
                <Card className="h-full transition hover:border-accent/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <s.icon size={20} />
                  </div>
                  <h3 className="mt-3 font-serif text-base text-ink">{s.name}</h3>
                  <p className="mt-1.5 text-sm text-muted">{s.cardSummary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                    View sector guide <ArrowRight size={14} />
                  </span>
                </Card>
              </Link>
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
                  onClick={() => navigate(user ? '/dashboard' : '/signup')}
                >
                  {user ? 'Go to dashboard' : 'Start free trial'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-navy py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-serif text-2xl text-navy-contrast sm:text-3xl">
            {user ? 'Pick up where you left off' : 'Ready to run your first assessment?'}
          </h2>
          <p className="mt-3 text-navy-contrast/70">
            {user ? 'Head back to your dashboard to continue.' : 'Start your free 7-day trial, no credit card required.'}
          </p>
          <Button onClick={() => navigate(user ? '/dashboard' : '/signup')} className="mt-6 px-6 py-3 text-base">
            {user ? 'Go to dashboard' : 'Start free trial'} <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Connexus" className="h-6 w-6 object-contain" />
            <span>© {new Date().getFullYear()} Connexus</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/legal" className="hover:text-ink">Legal</Link>
            <Link to="/privacy" className="hover:text-ink">Privacy</Link>
            <Link to="/terms" className="hover:text-ink">Terms</Link>
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
