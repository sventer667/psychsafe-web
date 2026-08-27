import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { ComingSoon } from './pages/ComingSoon'
import { hasPreviewAccess } from './lib/previewAccess'
import { Home } from './pages/Home'
import { SectorGuide } from './pages/SectorGuide'
import { Legal } from './pages/Legal'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { ForgotPassword } from './pages/ForgotPassword'
import { AcceptInvite } from './pages/AcceptInvite'
import { Dashboard } from './pages/Dashboard'
import { Cases } from './pages/Cases'
import { CaseDetail } from './pages/CaseDetail'
import { Billing } from './pages/Billing'
import { Team } from './pages/Team'
import { Security } from './pages/Security'

// Pre-launch switch. Set VITE_MAINTENANCE_MODE=true as a build-time env var
// on the connexus-app Render service (then redeploy) to take the whole site
// behind the "coming soon" placeholder, with every route, not just the
// homepage, resolving to it. Unset it (or set to "false") and redeploy to
// bring the real app back. No route changes needed either way.
const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === 'true'

export default function App() {
  if (MAINTENANCE_MODE && !hasPreviewAccess()) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sectors/:slug" element={<SectorGuide />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/invite/:token" element={<AcceptInvite />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/team" element={<Team />} />
            <Route path="/security" element={<Security />} />
            <Route path="/billing" element={<Billing />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
