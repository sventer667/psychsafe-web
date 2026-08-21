import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Topbar } from './Topbar'
import { TrialBanner } from './TrialBanner'
import { useAuth } from '../context/AuthContext'
import { isTrialExpired } from '../lib/trial'

export function Layout() {
  const { user, org, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted">Loading…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // A locked org can still reach Billing to see the paywall and subscribe.
  // Every other page bounces there, matching what the backend's
  // requireTrialActive gate actually allows (Dashboard, Cases, and Team all
  // hit the API and would 402 anyway).
  if (isTrialExpired(org) && location.pathname !== '/billing') {
    return <Navigate to="/billing" replace />
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Topbar />
      <TrialBanner />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
