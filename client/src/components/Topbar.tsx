import { NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, FolderLock, Users, ShieldCheck, CreditCard, LogOut, Globe } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases', label: 'Assessments', icon: FolderLock },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/security', label: 'Security', icon: ShieldCheck },
  { to: '/billing', label: 'Billing', icon: CreditCard },
]

export function Topbar() {
  const { user, org, logout } = useAuth()

  return (
    <header className="sticky top-0 z-10 bg-navy">
      <div className="h-[3px] bg-gradient-to-r from-accent via-accent to-navy" />
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <Link to="/" title="Back to the Connexus website" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-contrast">
            C
          </div>
          <div className="font-serif text-lg font-semibold text-navy-contrast">Connexus</div>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? 'bg-accent/20 text-accent' : 'text-navy-contrast/70 hover:bg-white/10 hover:text-navy-contrast'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 border-l border-white/15 pl-4">
          <div className="text-right">
            <div className="text-sm font-medium text-navy-contrast">{user?.name}</div>
            <div className="text-xs text-navy-contrast/60">{org?.name}</div>
          </div>
          <Link
            to="/"
            title="Back to the Connexus website"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-contrast/70 transition hover:bg-white/10 hover:text-white"
          >
            <Globe size={16} />
          </Link>
          <button
            onClick={logout}
            title="Log out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-contrast/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
