import { Link } from 'react-router-dom'
import { AlertTriangle, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isTrialExpired, daysLeftInTrial } from '../lib/trial'

export function TrialBanner() {
  const { org } = useAuth()
  const expired = isTrialExpired(org)
  const daysLeft = daysLeftInTrial(org)

  if (expired) {
    return (
      <div className="bg-destructive/15 px-6 py-2.5 text-center text-sm text-destructive">
        <Lock size={13} className="mr-1.5 inline" />
        Your 7-day free trial has ended and access is locked.{' '}
        <Link to="/billing" className="font-medium underline">Subscribe below to pick up right where you left off.</Link>
      </div>
    )
  }

  if (daysLeft !== null && daysLeft <= 3) {
    return (
      <div className="bg-alert/15 px-6 py-2.5 text-center text-sm text-alert">
        <AlertTriangle size={13} className="mr-1.5 inline" />
        {daysLeft <= 0
          ? 'Your free trial ends today.'
          : `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`}{' '}
        <Link to="/billing" className="font-medium underline">Subscribe now</Link> to avoid losing access.
      </div>
    )
  }

  return null
}
