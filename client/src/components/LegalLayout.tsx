import type { ReactNode } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/Button'
import logo from '../assets/connexus-logo.png'

// Shared header/footer for the three standalone legal pages (Legal, Privacy,
// Terms), same public-page treatment as Home and SectorGuide. Original
// structure and wording throughout, referenced against a competitor's
// equivalent pages only for which topics an Australian SaaS legal suite
// needs to cover, not for any of their specific language.

export function LegalLayout({
  title,
  version,
  effectiveDate,
  children,
}: {
  title: string
  version: string
  effectiveDate: string
  children: ReactNode
}) {
  const { user } = useAuth()
  const navigate = useNavigate()

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
        <Link to="/" className="mb-6 inline-block text-sm text-muted hover:text-ink">← Back to Connexus</Link>

        <h1 className="font-serif text-3xl text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">Version {version} · Effective {effectiveDate}</p>

        <div className="mt-6 flex gap-3 rounded-xl border border-alert/30 bg-alert/10 p-4 text-sm text-ink">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-alert" />
          <p>
            This is a working draft prepared to match what Connexus actually does today. It is not legal advice, and
            it should be reviewed by a qualified Australian lawyer, with the bracketed placeholders below filled in,
            before it's relied on as your published legal terms.
          </p>
        </div>

        <div className="prose-legal mt-10 space-y-8 text-sm leading-relaxed text-ink [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-ink [&_h3]:font-serif [&_h3]:text-base [&_h3]:text-ink [&_p]:text-muted [&_li]:text-muted [&_strong]:text-ink [&_a]:text-accent [&_a:hover]:underline">
          {children}
        </div>

        <div className="mt-12 border-t border-border pt-6 text-sm text-muted">
          <p className="mb-2 font-medium text-ink">Related documents</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/legal" className="hover:text-ink">Legal disclaimer</Link>
            <Link to="/privacy" className="hover:text-ink">Privacy policy</Link>
            <Link to="/terms" className="hover:text-ink">Terms &amp; conditions</Link>
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
