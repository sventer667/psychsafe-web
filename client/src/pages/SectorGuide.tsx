import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Scale } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getSector, SECTORS } from '../lib/sectors'
import logo from '../assets/connexus-logo.png'

// Public per-sector guide page, linked from the sector cards on Home. Same
// standalone header/footer treatment as Home (not the in-app Topbar/Layout),
// since this is marketing content visitors reach before signing in, or (via
// the app's "Home" link) while already signed in.

export function SectorGuide() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const sector = getSector(slug)

  if (!sector) return <Navigate to="/" replace />

  const Icon = sector.icon
  const otherSectors = SECTORS.filter((s) => s.slug !== sector.slug)

  return (
    <div className="bg-canvas">
      <header className="sticky top-0 z-10 bg-navy">
        <div className="h-[3px] bg-gradient-to-r from-accent via-accent to-navy" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src={logo} alt="Connexus" className="h-8 w-8 object-contain" />
            <div className="font-serif text-lg font-semibold text-navy-contrast">Connexus</div>
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

      <section className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} /> All sectors
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Icon size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">{sector.name}</h1>
        </div>

        <p className="mt-5 text-lg text-muted">{sector.guideIntro}</p>

        <h2 className="mt-10 font-serif text-xl text-ink">Common psychosocial hazards in {sector.name.toLowerCase()}</h2>
        <div className="mt-4 space-y-3">
          {sector.hazards.map((h) => (
            <Card key={h.name}>
              <h3 className="font-serif text-base text-ink">{h.name}</h3>
              <p className="mt-1 text-sm text-muted">{h.description}</p>
            </Card>
          ))}
        </div>

        <h2 className="mt-10 flex items-center gap-2 font-serif text-xl text-ink">
          <Scale size={18} className="text-accent" /> How Australian WHS legislation applies
        </h2>
        <p className="mt-3 text-muted">{sector.legislationNote}</p>
        <p className="mt-3 text-sm text-muted">
          The specific regulation and code of practice reference depends on the state or territory an assessment is
          run in. Connexus cites the right one automatically once you set a state on the assessment.
        </p>

        <Card className="mt-10 flex flex-col items-start gap-3 border-accent/30 bg-accent/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-serif text-lg text-ink">Run this as a structured assessment</h3>
            <p className="mt-1 text-sm text-muted">
              Start from the hazard register, rate the risks above for your organisation, and get a sealed,
              ready-to-share report.
            </p>
          </div>
          <Button onClick={() => navigate(user ? '/dashboard' : '/signup')} className="shrink-0 px-5 py-2.5">
            {user ? 'Go to dashboard' : 'Start your free trial'} <ArrowRight size={16} />
          </Button>
        </Card>

        <div className="mt-12 border-t border-border pt-8">
          <h2 className="font-serif text-lg text-ink">Other sectors</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherSectors.map((s) => (
              <Link
                key={s.slug}
                to={`/sectors/${s.slug}`}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:border-accent/50 hover:text-ink"
              >
                {s.name}
              </Link>
            ))}
          </div>
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
