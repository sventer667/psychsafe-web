import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { api, ApiError } from '../lib/api'
import logo from '../assets/humanora-logo.png'

export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    try {
      await api('/auth/reset-password', { method: 'POST', body: { token, password } })
      setDone(true)
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
          <p className="mt-2 text-sm text-muted">Choose a new password</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          {done ? (
            <div className="space-y-4">
              <p className="text-sm text-ink">Your password has been changed. Sign in with your new password.</p>
              <Link to="/login">
                <Button className="w-full">Go to sign in</Button>
              </Link>
            </div>
          ) : !token ? (
            <p className="text-sm text-ink">
              This reset link is incomplete. <Link to="/forgot-password" className="text-accent hover:underline">Request a new one</Link>.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
              </div>
              <div>
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</Button>
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
