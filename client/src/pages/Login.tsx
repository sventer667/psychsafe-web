import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { ApiError } from '../lib/api'
import logo from '../assets/connexus-logo.png'

export function Login() {
  const { login, loginWithTotp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // When a login response comes back needing a second factor, we hold the
  // pending token here and swap the form for a code-entry step. Nothing is
  // stored in the real session until that second step succeeds.
  const [pendingToken, setPendingToken] = useState<string | null>(null)
  const [pendingName, setPendingName] = useState('')
  const [code, setCode] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await login(email, password)
      if (result.requiresTotp) {
        setPendingToken(result.pendingToken)
        setPendingName(result.name)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  async function onSubmitCode(e: FormEvent) {
    e.preventDefault()
    if (!pendingToken) return
    setError('')
    setBusy(true)
    try {
      await loginWithTotp(pendingToken, code)
      navigate('/dashboard')
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
          <div className="mx-auto flex h-48 w-48 items-center justify-center p-6">
            <img src={logo} alt="Connexus OHS Consultants" className="h-full w-full object-contain" />
          </div>
          <p className="mt-2 text-sm text-muted">
            {pendingToken ? `Welcome back, ${pendingName}` : 'Sign in to your account'}
          </p>
        </div>

        {!pendingToken ? (
          <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link to="/signup" className="text-accent hover:underline">Sign up</Link>
              <Link to="/forgot-password" className="text-muted hover:text-ink">Forgot password?</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={onSubmitCode} className="space-y-4 rounded-xl border border-border bg-surface p-6">
            <div>
              <Label htmlFor="code">Authentication code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                placeholder="6-digit code or backup code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted">
                Enter the code from your authenticator app, or one of your backup codes.
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Verifying…' : 'Verify'}
            </Button>
            <button
              type="button"
              className="w-full text-center text-sm text-muted hover:text-ink"
              onClick={() => {
                setPendingToken(null)
                setCode('')
                setError('')
              }}
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
