import { useState, type FormEvent } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import { Card, Badge } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input, Label, Select, Textarea } from '../ui/Input'
import type { ActionItem, ActionStatus, Hazard } from '../../lib/types'

const STATUSES: ActionStatus[] = ['pending', 'in_progress', 'verification_pending', 'complete', 'closed']

const STATUS_LABEL: Record<ActionStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  verification_pending: 'Verification Pending',
  complete: 'Complete',
  closed: 'Closed',
}

const STATUS_TONE: Record<ActionStatus, 'default' | 'accent' | 'destructive' | 'success' | 'alert'> = {
  pending: 'default',
  in_progress: 'accent',
  verification_pending: 'alert',
  complete: 'success',
  closed: 'default',
}

export function ActionPlanTab({
  actionItems,
  hazards,
  readOnly,
  onAdd,
  onStatusChange,
}: {
  actionItems: ActionItem[]
  hazards: Hazard[]
  readOnly: boolean
  onAdd: (input: { title: string; description: string; ownerName: string; dueDate: string; hazardId: number | '' }) => Promise<void>
  onStatusChange: (actionId: number, status: ActionStatus) => Promise<void>
}) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [hazardId, setHazardId] = useState<number | ''>('')
  const [busy, setBusy] = useState(false)

  const sorted = [...actionItems].sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate.localeCompare(b.dueDate)
  })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await onAdd({ title, description, ownerName, dueDate, hazardId })
      setShowForm(false)
      setTitle('')
      setDescription('')
      setOwnerName('')
      setDueDate('')
      setHazardId('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg text-ink">Action Plan</h2>
          <p className="text-sm text-muted">{actionItems.length} action{actionItems.length === 1 ? '' : 's'} tracked</p>
        </div>
        {!readOnly && (
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus size={16} /> New action
          </Button>
        )}
      </div>

      {showForm && !readOnly && (
        <Card className="mb-6">
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="actTitle">Title *</Label>
              <Input id="actTitle" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="actDesc">Description</Label>
              <Textarea id="actDesc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="actOwner">Owner</Label>
              <Input id="actOwner" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="actDue">Due date</Label>
              <Input id="actDue" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="actHazard">Linked hazard (optional)</Label>
              <Select
                id="actHazard"
                value={hazardId}
                onChange={(e) => setHazardId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">None</option>
                {hazards.map((h) => (
                  <option key={h.id} value={h.id}>{h.title}</option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-muted">
                One hazard per action. If this action addresses more than one hazard, add it again for each
                hazard, or use the "Recommended actions" button on the hazard itself in the Hazard Register.
              </p>
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add action'}</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {sorted.map((item) => {
          const hazard = hazards.find((h) => h.id === item.hazardId)
          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-ink">{item.title}</div>
                    {item.isOverdue && (
                      <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                        <AlertTriangle size={12} /> Overdue
                      </span>
                    )}
                  </div>
                  {item.description && <p className="mt-1 text-sm text-muted">{item.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    {item.ownerName && <span>Owner: {item.ownerName}</span>}
                    {item.dueDate && <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>}
                    {hazard && <span>Hazard: {hazard.title}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                  {!readOnly && (
                    <Select
                      className="w-44"
                      value={item.status}
                      onChange={(e) => onStatusChange(item.id, e.target.value as ActionStatus)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </Select>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
        {actionItems.length === 0 && <p className="text-sm text-muted">No action items yet.</p>}
      </div>
    </div>
  )
}
