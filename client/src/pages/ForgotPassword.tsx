import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { api, ApiError } from '../lib/api'
import logo from '../assets/humanora-logo.png'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email } })
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center p-3">
            <img src={logo} alt="Humanora" className="h-full w-full object-contain" />
          </div>
          <p className="mt-2 text-sm text-muted">Reset your password</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          {sent ? (
            <p className="text-sm text-ink">
              If an account exists for {email}, a reset link has been sent. It expires in 1 hour. Check your spam folder if it doesn't arrive.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted">
            <Link to="/login" className="text-accent hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
