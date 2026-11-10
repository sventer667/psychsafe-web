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
import { Support } from './pages/Support'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { AcceptInvite } from './pages/AcceptInvite'
import { Dashboard } from './pages/Dashboard'
import { Cases } from './pages/Cases'
import { CaseDetail } from './pages/CaseDetail'
import { Enterprise } from './pages/Enterprise'
import { Billing } from './pages/Billing'
import { Team } from './pages/Team'
import { Security } from './pages/Security'
import { GapCheck } from './pages/GapCheck'
import { Unsubscribe } from './pages/Unsubscribe'
import { GuideVictoria } from './pages/GuideVictoria'
import { GuideNSW } from './pages/GuideNSW'
import { GuideQLD } from './pages/GuideQLD'
import { GuideTAS } from './pages/GuideTAS'
import { GuideACT } from './pages/GuideACT'
import { GuideWA } from './pages/GuideWA'
import { GuideSA } from './pages/GuideSA'
import { GuideNT } from './pages/GuideNT'

// Pre-launch switch. Set VITE_MAINTENANCE_MODE=true as a build-time env var
// on the connexus-app Render service (then redeploy) to take the whole site
// behind the "coming soon" placeholder, with every route, not just the
// homepage, resolving to it. Unset it (or set to "false") and redeploy to
// bring the real app back. No route changes needed either way.
const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === 'true'

// The gap-check tool is the public lead-gen funnel, so it stays reachable
// even while the rest of the site is behind the coming-soon gate (mirrors
// the /api/gap-check exemption on the server's maintenance-mode gate).
// Checked against the raw URL rather than a route match, since this decision
// happens before the router (and its Routes) is even rendered.
function isGapCheckPath() {
  return (
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/gap-check') || window.location.pathname.startsWith('/unsubscribe'))
  )
}

export default function App() {
  if (MAINTENANCE_MODE && !hasPreviewAccess() && !isGapCheckPath()) {
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
          <Route path="/gap-check" element={<GapCheck />} />
          <Route path="/guides/victoria-psychosocial-hazards" element={<GuideVictoria />} />
          <Route path="/guides/nsw-psychosocial-hazards" element={<GuideNSW />} />
          <Route path="/guides/queensland-psychosocial-hazards" element={<GuideQLD />} />
          <Route path="/guides/tasmania-psychosocial-hazards" element={<GuideTAS />} />
          <Route path="/guides/act-psychosocial-hazards" element={<GuideACT />} />
          <Route path="/guides/wa-psychosocial-hazards" element={<GuideWA />} />
          <Route path="/guides/sa-psychosocial-hazards" element={<GuideSA />} />
          <Route path="/guides/nt-psychosocial-hazards" element={<GuideNT />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />          
          <Route path="/support" element={<Support />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/invite/:token" element={<AcceptInvite />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/team" element={<Team />} />
            <Route path="/security" element={<Security />} />
            <Route path="/enterprise" element={<Enterprise />} />
            <Route path="/billing" element={<Billing />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
