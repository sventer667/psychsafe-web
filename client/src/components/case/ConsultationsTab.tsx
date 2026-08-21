import { useState, type FormEvent } from 'react'
import { Plus, Users } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input, Label, Textarea } from '../ui/Input'
import type { Consultation } from '../../lib/types'

export function ConsultationsTab({
  consultations,
  readOnly,
  onAdd,
}: {
  consultations: Consultation[]
  readOnly: boolean
  onAdd: (input: { date: string; method: string; attendees: string; summary: string }) => Promise<void>
}) {
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState('')
  const [method, setMethod] = useState('')
  const [attendees, setAttendees] = useState('')
  const [summary, setSummary] = useState('')
  const [busy, setBusy] = useState(false)

  const sorted = [...consultations].sort((a, b) => b.date.localeCompare(a.date))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await onAdd({ date, method, attendees, summary })
      setShowForm(false)
      setDate('')
      setMethod('')
      setAttendees('')
      setSummary('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg text-ink">Consultations</h2>
          <p className="text-sm text-muted">
            {consultations.length} record{consultations.length === 1 ? '' : 's'}. Worker consultation is a legislated
            requirement of every psychosocial risk assessment.
          </p>
        </div>
        {!readOnly && (
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus size={16} /> Log consultation
          </Button>
        )}
      </div>

      {showForm && !readOnly && (
        <Card className="mb-6">
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="consDate">Date *</Label>
              <Input id="consDate" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="consMethod">Method</Label>
              <Input
                id="consMethod"
                placeholder="e.g. Toolbox talk, survey, HSC meeting"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="consAttendees">Attendees</Label>
              <Input id="consAttendees" value={attendees} onChange={(e) => setAttendees(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="consSummary">Summary</Label>
              <Textarea id="consSummary" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save record'}</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {sorted.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-ink">{new Date(c.date).toLocaleDateString()}</div>
                {c.method && <div className="text-sm text-muted">{c.method}</div>}
              </div>
              {c.attendees && (
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Users size={12} /> {c.attendees}
                </div>
              )}
            </div>
            {c.summary && <p className="mt-2 text-sm text-ink">{c.summary}</p>}
          </Card>
        ))}
        {consultations.length === 0 && <p className="text-sm text-muted">No consultation records yet.</p>}
      </div>
    </div>
  )
}
