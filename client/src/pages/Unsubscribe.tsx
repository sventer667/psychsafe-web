import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { api, ApiError } from '../lib/api'
import logo from '../assets/humanora-logo.png'

// Reached from the "Unsubscribe" link in Gap Check emails. The action needs a
// click so link scanners that pre-fetch URLs cannot unsubscribe anyone.
export function Unsubscribe() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function confirm() {
    setState('busy')
    try {
      await api('/gap-check/unsubscribe', { method: 'POST', body: { token } })
      setState('done')
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      setState('error')
    }
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <img src={logo} alt="Humanora" className="mx-auto mb-8 h-16 w-auto" />
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          {state === 'done' ? (
            <>
              <h1 className="text-xl font-semibold text-ink">You're unsubscribed</h1>
              <p className="mt-2 text-sm text-muted">We won't send you tips and updates any more.</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-ink">Unsubscribe from tips and updates</h1>
              <p className="mt-2 text-sm text-muted">
                Confirm and we'll stop sending tips and updates from Humanora to this address.
              </p>
              {state === 'error' && <p className="mt-3 text-sm text-destructive">{message}</p>}
              <Button className="mt-6 w-full" disabled={!token || state === 'busy'} onClick={confirm}>
                {state === 'busy' ? 'Working…' : 'Unsubscribe'}
              </Button>
              {!token && <p className="mt-3 text-xs text-muted">This link is missing its token.</p>}
            </>
          )}
          <Link to="/" className="mt-6 block text-sm text-accent hover:underline">
            Back to humanora.com.au
          </Link>
        </div>
      </div>
    </div>
  )
}
