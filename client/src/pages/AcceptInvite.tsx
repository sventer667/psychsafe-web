import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { api, ApiError } from '../lib/api'
import type { Organization, User } from '../lib/types'
import logo from '../assets/connexus-logo.png'

interface InvitePreview {
  name: string
  email: string
  orgName: string
}

export function AcceptInvite() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [preview, setPreview] = useState<InvitePreview | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!token) return
    api<InvitePreview>(`/invites/token/${token}`)
      .then(setPreview)
      .catch(() => setNotFound(true))
  }, [token])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setError('')
    setBusy(true)
    try {
      const data = await api<{ token: string; user: User; org: Organization }>('/invites/accept', {
        method: 'POST',
        body: { token, password },
      })
      setSession(data.token, data.user, data.org)
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
          <div className="mx-auto flex h-24 w-24 items-center justify-center p-3">
            <img src={logo} alt="Connexus OHS" className="h-full w-full object-contain" />
          </div>
          <p className="mt-2 text-sm text-muted">
            {preview ? `Join ${preview.orgName} on Connexus` : 'Accept your invite'}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          {notFound && (
            <div className="space-y-3 text-center">
              <p className="text-sm text-destructive">This invite link is invalid or has expired.</p>
              <p className="text-sm text-muted">
                Ask whoever invited you to send a fresh one, or{' '}
                <Link to="/login" className="text-accent hover:underline">sign in</Link> if you already have an account.
              </p>
            </div>
          )}

          {!notFound && preview && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={preview.name} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={preview.email} disabled />
              </div>
              <div>
                <Label htmlFor="password">Set a password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? 'Joining…' : `Join ${preview.orgName}`}
              </Button>
            </form>
          )}

          {!notFound && !preview && <p className="text-center text-sm text-muted">Loading invite…</p>}
        </div>
      </div>
    </div>
  )
}
