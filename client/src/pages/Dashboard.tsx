import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FileLock2, AlertTriangle, Plus, CalendarClock, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Card, Badge } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { HeatMap } from '../components/HeatMap'
import { RiskGauges } from '../components/RiskGauges'
import { api } from '../lib/api'
import { reviewStatus } from '../lib/reassessment'
import type { Case, ActionItem, Heatmap, RiskGauges as RiskGaugesData } from '../lib/types'

const DUE_SOON_DAYS = 3

export function Dashboard() {
  const { user, org } = useAuth()
  const navigate = useNavigate()
  const [cases, setCases] = useState<Case[]>([])
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [heatmap, setHeatmap] = useState<Heatmap | null>(null)
  const [gauges, setGauges] = useState<RiskGaugesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([api<Case[]>('/cases'), api<Heatmap>('/cases/heatmap'), api<RiskGaugesData>('/cases/gauges')])
      .then(async ([cs, hm, gg]) => {
        if (cancelled) return
        setCases(cs)
        setHeatmap(hm)
        setGauges(gg)
        const perCase = await Promise.all(cs.map((c) => api<ActionItem[]>(`/action-items?caseId=${c.id}`)))
        if (cancelled) return
        setActionItems(perCase.flat())
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const openCases = cases.filter((c) => c.status === 'open').length
  const overdue = actionItems.filter((a) => a.isOverdue).length
  const openActions = actionItems.filter((a) => a.status !== 'complete' && a.status !== 'closed').length
  const { status: reviewDueStatus, dueDate: reviewDueDate } = reviewStatus(cases, org)

  // Actions assigned to the person actually looking at this dashboard, not
  // just the org-wide overdue count above. This is what makes accountability
  // real: a real user owns the action, and that same user gets told about it
  // the moment they log in, rather than accountability living only inside a
  // case someone else might not open for weeks.
  const myOverdueActions = user ? actionItems.filter((a) => a.ownerId === user.id && a.isOverdue) : []
  const myDueSoonActions = user
    ? actionItems.filter((a) => {
        if (a.ownerId !== user.id || a.isOverdue) return false
        if (a.status === 'complete' || a.status === 'closed') return false
        if (!a.dueDate) return false
        const dueSoonCutoff = new Date()
        dueSoonCutoff.setDate(dueSoonCutoff.getDate() + DUE_SOON_DAYS)
        return new Date(a.dueDate) <= dueSoonCutoff
      })
    : []
  const myFlaggedActions = [...myOverdueActions, ...myDueSoonActions]

  return (
    <div>
      {org && !org.state && (
        <Card className="mb-6 border-alert/40 bg-alert/5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-alert" />
            <div className="flex-1">
              <div className="text-sm font-medium text-ink">Set your organisation's state or territory first</div>
              <p className="mt-1 text-sm text-muted">
                Hazard legislation citations and compliance reports are matched to your state/territory, so this
                should be the first thing you set up. Add it on the{' '}
                <Link to="/billing" className="text-accent hover:underline">Billing &amp; Organisation</Link> page.
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/billing')}>
              Set it now
            </Button>
          </div>
        </Card>
      )}

      {myFlaggedActions.length > 0 && (
        <Card
          className={`mb-6 ${
            myOverdueActions.length > 0 ? 'border-destructive/40 bg-destructive/5' : 'border-alert/40 bg-alert/5'
          }`}
        >
          <div className="flex items-start gap-3">
            <Bell
              size={18}
              className={`mt-0.5 shrink-0 ${myOverdueActions.length > 0 ? 'text-destructive' : 'text-alert'}`}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-ink">
                {myOverdueActions.length > 0
                  ? `You have ${myOverdueActions.length} action${myOverdueActions.length === 1 ? '' : 's'} overdue`
                  : `You have ${myDueSoonActions.length} action${myDueSoonActions.length === 1 ? '' : 's'} due soon`}
              </div>
              <p className="mt-1 text-sm text-muted">
                These are action items assigned to you personally, across all of your assessments.
              </p>
              <div className="mt-2 space-y-1">
                {myFlaggedActions.slice(0, 4).map((a) => {
                  const parentCase = cases.find((c) => c.id === a.caseId)
                  return (
                    <Link
                      key={a.id}
                      to={`/cases/${a.caseId}?tab=${encodeURIComponent('Action Plan')}`}
                      className="block text-sm text-accent hover:underline"
                    >
                      {a.title}
                      {parentCase ? ` — ${parentCase.name}` : ''}
                      {a.dueDate ? ` (due ${new Date(a.dueDate).toLocaleDateString()})` : ''}
                    </Link>
                  )
                })}
                {myFlaggedActions.length > 4 && (
                  <div className="text-xs text-muted">+{myFlaggedActions.length - 4} more</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {(reviewDueStatus === 'overdue' || reviewDueStatus === 'due_soon') && reviewDueDate && (
        <Card
          className={`mb-6 ${
            reviewDueStatus === 'overdue' ? 'border-destructive/40 bg-destructive/5' : 'border-alert/40 bg-alert/5'
          }`}
        >
          <div className="flex items-start gap-3">
            <CalendarClock
              size={18}
              className={`mt-0.5 shrink-0 ${reviewDueStatus === 'overdue' ? 'text-destructive' : 'text-alert'}`}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-ink">
                {reviewDueStatus === 'overdue' ? 'Reassessment overdue' : 'Reassessment due soon'}
              </div>
              <p className="mt-1 text-sm text-muted">
                {reviewDueStatus === 'overdue'
                  ? `Based on your ${org?.reviewFrequencyMonths}-month reassessment cadence, a new assessment was due on ${reviewDueDate.toLocaleDateString()}. Psychosocial risk changes over time, an assessment that's gone stale can't be relied on to reflect current conditions.`
                  : `Based on your ${org?.reviewFrequencyMonths}-month reassessment cadence, a new assessment is due by ${reviewDueDate.toLocaleDateString()}.`}{' '}
                Change the cadence on the{' '}
                <Link to="/billing" className="text-accent hover:underline">Billing &amp; Organisation</Link> page.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/cases')}>
            Start new assessment
          </Button>
        </div>
      </Card>
      )}

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-ink">Dashboard</h1>
          <p className="text-sm text-muted">{org?.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button onClick={() => navigate('/cases')} className="cursor-pointer">
            <Badge tone={openCases > 0 ? 'accent' : 'default'}>{openCases} open case{openCases === 1 ? '' : 's'}</Badge>
          </button>
          <Badge tone={openActions > 0 ? 'alert' : 'success'}>{openActions} open action{openActions === 1 ? '' : 's'}</Badge>
          <Badge tone={overdue > 0 ? 'destructive' : 'success'}>{overdue} overdue</Badge>
        </div>
      </div>

      <div className="mb-6">{gauges && <RiskGauges data={gauges} />}</div>

      <div className="mb-6">{heatmap && <HeatMap data={heatmap} />}</div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Assessments</h2>
          {cases.length > 0 && (
            <Button variant="secondary" onClick={() => navigate('/cases')}>
              <Plus size={16} /> New assessment
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {cases.map((c) => (
            <div
              key={c.id}
              className="flex cursor-pointer items-center justify-between border-b border-border py-2 last:border-0"
              onClick={() => navigate(`/cases/${c.id}`)}
            >
              <div>
                <div className="text-sm text-ink">{c.name}</div>
                <div className="text-xs text-muted">Opened {new Date(c.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                {c.status === 'closed' && (
                  <Badge tone="accent">
                    <FileLock2 size={12} className="mr-1 inline" /> Sealed
                  </Badge>
                )}
                <Badge tone={c.status === 'open' ? 'success' : 'default'}>{c.status}</Badge>
              </div>
            </div>
          ))}
          {!loading && cases.length === 0 && (
            <div className="py-2 text-sm text-muted">
              No assessments yet.{' '}
              <button onClick={() => navigate('/cases')} className="text-accent hover:underline">
                Start your first psychosocial risk assessment →
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
