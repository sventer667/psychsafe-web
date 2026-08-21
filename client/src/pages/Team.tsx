import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Copy, Check, X, Users as UsersIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, Badge } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { api, ApiError } from '../lib/api'
import type { TeamData } from '../lib/types'

const TIER_LABEL: Record<string, string> = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' }

export function Team() {
  const { user } = useAuth()
  const [data, setData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const d = await api<TeamData>('/team')
      setData(d)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api('/invites', { method: 'POST', body: { name, email } })
      setShowForm(false)
      setName('')
      setEmail('')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  async function revoke(id: number) {
    await api(`/invites/${id}`, { method: 'DELETE' })
    await load()
  }

  function inviteLink(token: string) {
    return `${window.location.origin}/invite/${token}`
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(inviteLink(token))
    setCopiedToken(token)
    setTimeout(() => setCopiedToken((t) => (t === token ? null : t)), 2000)
  }

  const atLimit = data ? data.seatsUsed >= data.seatLimit : false

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">Team</h1>
          <p className="text-sm text-muted">Everyone with access to your organisation's assessments</p>
        </div>
        {!atLimit && (
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus size={16} /> Invite teammate
          </Button>
        )}
      </div>

      {data && (
        <Card className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <UsersIcon size={16} className="text-muted" />
            <span className="text-ink">{data.seatsUsed} of {data.seatLimit} seats used</span>
          </div>
          <Badge tone={atLimit ? 'alert' : 'default'}>{TIER_LABEL[data.planTier] || data.planTier} plan</Badge>
        </Card>
      )}

      {atLimit && !showForm && (
        <Card className="mb-6">
          <p className="text-sm text-muted">
            You're at your plan's seat limit. Upgrade on the{' '}
            <Link to="/billing" className="text-accent hover:underline">Billing &amp; Organisation</Link> page to invite
            more people.
          </p>
        </Card>
      )}

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={onSubmit} className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="inviteName">Name</Label>
              <Input id="inviteName" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label htmlFor="inviteEmail">Email</Label>
              <Input id="inviteEmail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Inviting…' : 'Send invite'}</Button>
          </form>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="mb-3 font-serif text-lg text-ink">Members</h2>
        <div className="space-y-2">
          {data?.users.map((u) => (
            <div key={u.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
              <div>
                <div className="text-sm text-ink">
                  {u.name} {u.id === user?.id && <span className="text-xs text-muted">(you)</span>}
                </div>
                <div className="text-xs text-muted">{u.email}</div>
              </div>
              <Badge tone="default">{u.role === 'admin' ? 'Admin' : 'Member'}</Badge>
            </div>
          ))}
          {!loading && data?.users.length === 0 && <p className="text-sm text-muted">No team members yet.</p>}
        </div>
      </Card>

      {(data?.invites.length ?? 0) > 0 && (
        <Card>
          <h2 className="mb-1 font-serif text-lg text-ink">Pending invites</h2>
          <p className="mb-3 text-sm text-muted">
            There's no email sending configured yet, so copy each link and send it yourself.
          </p>
          <div className="space-y-2">
            {data?.invites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
                <div>
                  <div className="text-sm text-ink">{inv.name}</div>
                  <div className="text-xs text-muted">{inv.email} · expires {new Date(inv.expiresAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyLink(inv.token)}
                    className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:border-accent/50 hover:text-ink"
                  >
                    {copiedToken === inv.token ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    {copiedToken === inv.token ? 'Copied' : 'Copy link'}
                  </button>
                  <button
                    onClick={() => revoke(inv.id)}
                    title="Revoke invite"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-destructive/15 hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
