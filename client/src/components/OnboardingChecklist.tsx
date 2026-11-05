import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Sparkles, X } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'

type Status = {
  profile: boolean
  assessment: boolean
  hazard: boolean
  action: boolean
  consultation: boolean
  teammate: boolean
  sampleCaseId: number | null
}

function dismissKey(orgId?: number) {
  return `humanora_onboarding_dismissed_${orgId ?? 0}`
}

// "Getting started" checklist for the Dashboard. It ticks itself off from what
// the organisation has actually done, and disappears when everything is done or
// when dismissed. The sample assessment is excluded from the counts server-side.
export function OnboardingChecklist() {
  const { org } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(dismissKey(org?.id)) === '1')
    } catch {
      /* storage unavailable, keep showing */
    }
    api<Status>('/onboarding')
      .then(setStatus)
      .catch(() => setStatus(null))
  }, [org?.id])

  if (!status || dismissed) return null

  const items = [
    { done: status.profile, label: "Set your organisation's state or territory", hint: 'So legislation references match where you operate', to: '/billing' },
    { done: status.assessment, label: 'Create your first assessment', hint: 'One assessment per site, team or review period', to: '/cases' },
    { done: status.hazard, label: 'Add a hazard from the library', hint: 'Pick from the built-in psychosocial hazard library', to: '/cases' },
    { done: status.action, label: 'Add an action with an owner and due date', hint: 'Actions show up in your Dashboard reminders', to: '/cases' },
    { done: status.consultation, label: 'Record a worker consultation', hint: 'Consultation is a legislative requirement', to: '/cases' },
    { done: status.teammate, label: 'Invite a teammate', hint: 'Share the work and the accountability', to: '/team' },
  ]
  const doneCount = items.filter((i) => i.done).length
  if (doneCount === items.length) return null

  function dismiss() {
    try {
      window.localStorage.setItem(dismissKey(org?.id), '1')
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }

  async function openSample() {
    setError('')
    if (status?.sampleCaseId) {
      navigate(`/cases/${status.sampleCaseId}`)
      return
    }
    setBusy(true)
    try {
      const r = await api<{ caseId: number }>('/onboarding/sample', { method: 'POST' })
      navigate(`/cases/${r.caseId}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the sample assessment')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="mb-6">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-ink">Getting started</h2>
          <p className="text-sm text-muted">
            {doneCount} of {items.length} done. Work through these to run your first psychosocial risk assessment.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-ink"
          title="Hide this checklist"
          aria-label="Hide this checklist"
        >
          <X size={16} />
        </button>
      </div>

      <div className="my-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-accent" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>

      <ul className="divide-y divide-border">
        {items.map((i) => (
          <li key={i.label} className="flex items-center justify-between gap-3 py-2">
            <div className="flex items-start gap-2">
              {i.done ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
              ) : (
                <Circle size={18} className="mt-0.5 shrink-0 text-muted" />
              )}
              <div>
                <div className={`text-sm ${i.done ? 'text-muted line-through' : 'text-ink'}`}>{i.label}</div>
                {!i.done && <div className="text-xs text-muted">{i.hint}</div>}
              </div>
            </div>
            {!i.done && (
              <button type="button" onClick={() => navigate(i.to)} className="shrink-0 text-sm text-accent hover:underline">
                Go
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-canvas p-3">
        <Sparkles size={18} className="shrink-0 text-accent" />
        <div className="min-w-0 flex-1 text-sm text-ink">
          Want to see how it works first? Open a filled-in example assessment. It's clearly labelled as a sample and you
          can delete it at any time.
        </div>
        <Button variant="secondary" onClick={openSample} disabled={busy}>
          {busy ? 'Creating…' : status.sampleCaseId ? 'Open sample' : 'Try a sample assessment'}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </Card>
  )
}
