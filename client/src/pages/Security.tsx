import { useState, type FormEvent } from 'react'
import { ShieldCheck, ShieldOff, Copy, Check, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, Badge } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { api, ApiError } from '../lib/api'

type SetupState = { secret: string; qrCodeDataUrl: string }

export function Security() {
  const { user, refresh } = useAuth()
  const enabled = !!user?.totpEnabled

  // Enrollment moves through: idle -> setup (QR shown, awaiting a code) ->
  // backupCodes (verified, codes shown exactly once) -> back to idle.
  const [setup, setSetup] = useState<SetupState | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [codesSaved, setCodesSaved] = useState(false)

  const [showDisable, setShowDisable] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function startSetup() {
    setError('')
    setBusy(true)
    try {
      const data = await api<SetupState>('/auth/2fa/setup', { method: 'POST' })
      setSetup(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api<{ ok: true; backupCodes: string[] }>('/auth/2fa/verify', {
        method: 'POST',
        body: { code },
      })
      setBackupCodes(data.backupCodes)
      setSetup(null)
      setCode('')
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  function copySecret() {
    if (!setup) return
    navigator.clipboard.writeText(setup.secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function finishEnrollment() {
    setBackupCodes(null)
    setCodesSaved(false)
  }

  async function onDisable(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api('/auth/2fa/disable', { method: 'POST', body: { password: disablePassword } })
      setShowDisable(false)
      setDisablePassword('')
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-ink">Security</h1>
        <p className="text-sm text-muted">Manage how you sign in to your account</p>
      </div>

      {backupCodes ? (
        <Card className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-success" />
            <h2 className="font-serif text-lg text-ink">Two-factor authentication is enabled</h2>
          </div>
          <p className="mb-3 text-sm text-ink">
            Save these backup codes somewhere safe. Each one can be used once to sign in if you lose access to your
            authenticator app. They won't be shown again.
          </p>
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-border bg-canvas p-4 font-mono text-sm text-ink">
            {backupCodes.map((c) => (
              <div key={c}>{c}</div>
            ))}
          </div>
          <label className="mb-4 flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={codesSaved} onChange={(e) => setCodesSaved(e.target.checked)} />
            I've saved these backup codes somewhere safe
          </label>
          <Button onClick={finishEnrollment} disabled={!codesSaved}>Done</Button>
        </Card>
      ) : setup ? (
        <Card className="mb-6">
          <h2 className="mb-3 font-serif text-lg text-ink">Set up two-factor authentication</h2>
          <ol className="mb-4 space-y-4 text-sm text-ink">
            <li>
              <p className="mb-2 font-medium">1. Scan this QR code with your authenticator app</p>
              <img src={setup.qrCodeDataUrl} alt="QR code for authenticator app" className="h-40 w-40 rounded-lg border border-border" />
            </li>
            <li>
              <p className="mb-2 font-medium">Or enter this key manually</p>
              <div className="flex items-center gap-2">
                <code className="rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs text-muted">{setup.secret}</code>
                <button
                  type="button"
                  onClick={copySecret}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-ink"
                  title="Copy key"
                >
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </li>
          </ol>
          <form onSubmit={onVerify} className="space-y-3">
            <div>
              <Label htmlFor="verifyCode">2. Enter the 6-digit code from the app</Label>
              <Input
                id="verifyCode"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => { setSetup(null); setError('') }}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? 'Verifying…' : 'Verify and enable'}</Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {enabled ? <ShieldCheck size={18} className="text-success" /> : <ShieldOff size={18} className="text-muted" />}
              <div>
                <h2 className="font-serif text-lg text-ink">Two-factor authentication</h2>
                <p className="text-sm text-muted">
                  {enabled
                    ? 'Enabled. A code from your authenticator app is required every time you sign in.'
                    : 'Add a second layer of security using an authenticator app (like Google Authenticator or Authy).'}
                </p>
              </div>
            </div>
            <Badge tone={enabled ? 'success' : 'default'}>{enabled ? 'Enabled' : 'Disabled'}</Badge>
          </div>

          {!enabled && !showDisable && (
            <div className="mt-4">
              {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
              <Button onClick={startSetup} disabled={busy}>{busy ? 'Starting…' : 'Enable two-factor authentication'}</Button>
            </div>
          )}

          {enabled && !showDisable && (
            <div className="mt-4">
              <Button variant="secondary" onClick={() => setShowDisable(true)}>Disable two-factor authentication</Button>
            </div>
          )}

          {enabled && showDisable && (
            <form onSubmit={onDisable} className="mt-4 space-y-3 border-t border-border pt-4">
              <div className="flex items-start gap-2 rounded-lg border border-alert/30 bg-alert/10 p-3 text-sm text-ink">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-alert" />
                <p>Disabling two-factor authentication removes this extra layer of protection from your account.</p>
              </div>
              <div>
                <Label htmlFor="disablePassword">Confirm your password</Label>
                <Input
                  id="disablePassword"
                  type="password"
                  required
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => { setShowDisable(false); setDisablePassword(''); setError('') }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>{busy ? 'Disabling…' : 'Disable'}</Button>
              </div>
            </form>
          )}
        </Card>
      )}
    </div>
  )
}
