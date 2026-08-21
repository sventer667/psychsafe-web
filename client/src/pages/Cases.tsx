import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ShieldCheck, FileLock2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, Badge } from '../components/ui/Card'
import { Input, Label, Select } from '../components/ui/Input'
import { api } from '../lib/api'
import type { Case } from '../lib/types'

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']

export function Cases() {
  const { org } = useAuth()
  const navigate = useNavigate()
  const [cases, setCases] = useState<Case[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [state, setState] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const data = await api<Case[]>('/cases')
      setCases(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Pre-fills the new-assessment state with the org's default state, since
  // most assessments are for the org's main location, but it's editable per
  // assessment for orgs running one at a site in a different state.
  useEffect(() => {
    if (org?.state && !state) setState(org.state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const c = await api<Case>('/cases', { method: 'POST', body: { name, state } })
      setShowForm(false)
      setName('')
      navigate(`/cases/${c.id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">Assessments</h1>
          <p className="text-sm text-muted">{org?.name}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} /> New Assessment
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4">
            <div className="flex-1" style={{ minWidth: '220px' }}>
              <Label htmlFor="caseName">Assessment name</Label>
              <Input
                id="caseName"
                required
                placeholder="e.g. 2026 Psychosocial Risk Assessment"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div style={{ minWidth: '160px' }}>
              <Label htmlFor="caseState">State/Territory</Label>
              <Select id="caseState" value={state} onChange={(e) => setState(e.target.value)}>
                <option value="">Select state…</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create assessment'}</Button>
          </form>
          <p className="mt-2 text-xs text-muted">
            Defaults to your organisation's state. Change it if this assessment covers a site in a different
            state or territory, it's used to pick the right legislation citations for this assessment.
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {cases.map((c) => (
          <Card key={c.id} className="cursor-pointer hover:border-accent/40" onClick={() => navigate(`/cases/${c.id}`)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-ink">{c.name}</div>
                <div className="text-sm text-muted">
                  Opened {new Date(c.createdAt).toLocaleDateString()}
                  {c.state && ` · ${c.state}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.status === 'closed' && (
                  <Badge tone="accent">
                    <FileLock2 size={12} className="mr-1 inline" /> Sealed
                  </Badge>
                )}
                <Badge tone={c.status === 'open' ? 'success' : 'default'}>
                  <ShieldCheck size={12} className="mr-1 inline" /> {c.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
        {!loading && cases.length === 0 && !showForm && (
          <p className="text-sm text-muted">No assessments yet. Create one to get going.</p>
        )}
      </div>
    </div>
  )
}
