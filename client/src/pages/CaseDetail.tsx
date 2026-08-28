import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { FileLock2, Download, ShieldAlert, ArrowRight, Lock, History } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, Badge } from '../components/ui/Card'
import { Label, Select, Textarea } from '../components/ui/Input'
import { api, API_BASE, getToken, ApiError } from '../lib/api'
import type { Case, Hazard, HazardLibraryEntry, ActionItem, Consultation, ActionStatus } from '../lib/types'
import { HazardRegisterTab } from '../components/case/HazardRegisterTab'
import { ActionPlanTab } from '../components/case/ActionPlanTab'
import { ConsultationsTab } from '../components/case/ConsultationsTab'

// Hazard Register comes first since it's where an assessment actually
// starts, and Details (which holds the close & seal action) comes last so
// sealing reads as the final step of the workflow rather than competing
// with it for the first tab.
const TABS = ['Hazard Register', 'Action Plan', 'Consultations', 'Export', 'Details'] as const
type Tab = (typeof TABS)[number]

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']

export function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { org } = useAuth()
  const [searchParams] = useSearchParams()
  const initialTab = TABS.find((t) => t === searchParams.get('tab')) || TABS[0]
  const highlightCategory = searchParams.get('category') || ''
  const [tab, setTab] = useState<Tab>(initialTab)
  const [caseFile, setCaseFile] = useState<Case | null>(null)
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [library, setLibrary] = useState<HazardLibraryEntry[]>([])
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [busy, setBusy] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [savingState, setSavingState] = useState(false)
  const [stateSaved, setStateSaved] = useState(false)
  const [showReopenForm, setShowReopenForm] = useState(false)
  const [reopenReason, setReopenReason] = useState('')
  const [reopenError, setReopenError] = useState('')

  async function load() {
    if (!id) return
    const [c, h, lib, actions, cons] = await Promise.all([
      api<Case>(`/cases/${id}`),
      api<Hazard[]>(`/hazards?caseId=${id}`),
      api<HazardLibraryEntry[]>('/hazard-library'),
      api<ActionItem[]>(`/action-items?caseId=${id}`),
      api<Consultation[]>(`/consultations?caseId=${id}`),
    ])
    setCaseFile(c)
    setHazards(h)
    setLibrary(lib)
    setActionItems(actions)
    setConsultations(cons)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function addHazardFromLibrary(entry: HazardLibraryEntry, likelihood: number, consequence: number) {
    if (!id) return
    await api('/hazards', {
      method: 'POST',
      body: {
        caseId: Number(id),
        hazardLibraryId: entry.id,
        title: entry.name,
        category: entry.category,
        description: entry.description,
        likelihood,
        consequence,
      },
    })
    await load()
  }

  async function setResidualRating(hazard: Hazard, residualLikelihood: number, residualConsequence: number) {
    await api(`/hazards/${hazard.id}`, {
      method: 'PATCH',
      body: { residualLikelihood, residualConsequence },
    })
    await load()
  }

  async function addActionItem(input: { title: string; description: string; ownerName: string; dueDate: string; hazardId: number | '' }) {
    if (!id) return
    await api('/action-items', {
      method: 'POST',
      body: { caseId: Number(id), ...input, hazardId: input.hazardId || undefined },
    })
    await load()
  }

  async function addActionFromHazard(hazard: Hazard, title: string) {
    if (!id) return
    await api('/action-items', {
      method: 'POST',
      body: { caseId: Number(id), title, description: '', ownerName: '', dueDate: '', hazardId: hazard.id },
    })
    await load()
  }

  async function updateActionStatus(actionId: number, status: ActionStatus) {
    await api(`/action-items/${actionId}`, { method: 'PATCH', body: { status } })
    await load()
  }

  async function addConsultation(input: { date: string; method: string; attendees: string; summary: string }) {
    if (!id) return
    await api('/consultations', { method: 'POST', body: { caseId: Number(id), ...input } })
    await load()
  }

  async function updateCaseState(newState: string) {
    if (!id) return
    setSavingState(true)
    setStateSaved(false)
    try {
      const c = await api<Case>(`/cases/${id}`, { method: 'PATCH', body: { state: newState } })
      setCaseFile(c)
      setStateSaved(true)
    } finally {
      setSavingState(false)
    }
  }

  async function closeCase() {
    if (!id) return
    setBusy(true)
    try {
      const c = await api<Case>(`/cases/${id}/close`, { method: 'POST' })
      setCaseFile(c)
    } finally {
      setBusy(false)
    }
  }

  async function reopenCase() {
    if (!id) return
    setReopenError('')
    setBusy(true)
    try {
      const c = await api<Case>(`/cases/${id}/reopen`, { method: 'POST', body: { reason: reopenReason } })
      setCaseFile(c)
      setShowReopenForm(false)
      setReopenReason('')
    } catch (err) {
      setReopenError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  async function downloadReport() {
    if (!id) return
    setDownloading(true)
    try {
      const res = await fetch(`${API_BASE}/reports/case/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Failed to generate report')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(org?.name || 'case').replace(/[^a-z0-9]/gi, '-')}-report.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  if (!caseFile) return <p className="text-sm text-muted">Loading assessment…</p>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/cases')} className="text-sm text-muted hover:text-ink">
            ← Assessments
          </button>
          <h1 className="font-serif text-2xl text-ink">{caseFile.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {caseFile.status === 'closed' && <Badge tone="accent"><FileLock2 size={12} className="mr-1 inline" /> Sealed</Badge>}
          <Badge tone={caseFile.status === 'open' ? 'success' : 'default'}>{caseFile.status}</Badge>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Hazard Register' && (
        <div className="space-y-4">
          <HazardRegisterTab
            hazards={hazards}
            library={library}
            actionItems={actionItems}
            assessmentState={caseFile.state || ''}
            readOnly={caseFile.status === 'closed'}
            onAdd={addHazardFromLibrary}
            onAddAction={addActionFromHazard}
            onSetResidual={setResidualRating}
            highlightCategory={highlightCategory}
          />
          <NextStepButton onClick={() => setTab('Action Plan')} label="Action Plan" />
        </div>
      )}

      {tab === 'Action Plan' && (
        <div className="space-y-4">
          <ActionPlanTab
            actionItems={actionItems}
            hazards={hazards}
            readOnly={caseFile.status === 'closed'}
            onAdd={addActionItem}
            onStatusChange={updateActionStatus}
          />
          <NextStepButton onClick={() => setTab('Consultations')} label="Consultations" />
        </div>
      )}

      {tab === 'Consultations' && (
        <div className="space-y-4">
          <ConsultationsTab consultations={consultations} readOnly={caseFile.status === 'closed'} onAdd={addConsultation} />
          <NextStepButton onClick={() => setTab('Export')} label="Export" />
        </div>
      )}

      {tab === 'Export' && (
        <div className="space-y-4">
          <Card>
            <h2 className="mb-2 font-serif text-lg text-ink">Export report</h2>
            <p className="mb-4 text-sm text-muted">
              Generates a single PDF pulling together the hazard register, a risk-level breakdown, your action items
              ordered by how overdue they are, the consultation log, and the compliance obligations for your state,
              with your report preparer's name and credential on the cover.
            </p>
            {hazards.length === 0 && (
              <p className="mb-4 flex items-center gap-2 text-sm text-alert">
                <ShieldAlert size={14} /> Add at least one hazard before exporting for a meaningful report.
              </p>
            )}
            <Button onClick={downloadReport} disabled={downloading}>
              <Download size={16} /> {downloading ? 'Generating…' : 'Download PDF report'}
            </Button>
          </Card>
          <NextStepButton onClick={() => setTab('Details')} label="Details, to close & seal" />
        </div>
      )}

      {tab === 'Details' && (
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-serif text-lg text-ink">Assessment details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted">Organisation</div>
                <div className="text-ink">{org?.name}</div>
              </div>
              <div>
                <div className="text-muted">Opened</div>
                <div className="text-ink">{new Date(caseFile.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted">Status</div>
                <div className="text-ink capitalize">{caseFile.status}</div>
              </div>
            </div>
            <div className="mt-4 max-w-xs">
              <Label htmlFor="caseState">This assessment's state/territory</Label>
              <Select
                id="caseState"
                value={caseFile.state || ''}
                disabled={caseFile.status === 'closed' || savingState}
                onChange={(e) => updateCaseState(e.target.value)}
              >
                <option value="">Select state…</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-muted">
                Drives the legislation citations in the Hazard Register and PDF export for this assessment. If your
                organisation has sites in more than one state, set each assessment to the state that site is in
                (your organisation's own default state is set on the Billing page).
              </p>
              {savingState && <p className="mt-1 text-xs text-muted">Saving…</p>}
              {stateSaved && !savingState && <p className="mt-1 text-xs text-success">Saved</p>}
            </div>
          </Card>

          {caseFile.status === 'open' ? (
            <Card className="border-alert/40 bg-alert/5">
              <div className="mb-2 flex items-center gap-2">
                <Lock size={16} className="text-alert" />
                <h2 className="font-serif text-lg text-ink">Close &amp; seal this assessment</h2>
              </div>
              <p className="mb-3 text-sm font-medium text-ink">
                This is the final step. Make sure the Hazard Register, Action Plan, and Consultations tabs are
                complete first, closing locks the assessment from further edits.
              </p>
              <p className="mb-4 text-sm text-muted">
                Closing fingerprints every hazard, action item, and consultation record in this assessment with a
                SHA-256 hash, then attempts to lodge that fingerprint with a third-party RFC 3161 timestamping
                service, so the record's integrity and timing can be checked independently, without having to
                trust Connexus itself. The assessment can't be edited once sealed.
              </p>
              <Button onClick={closeCase} disabled={busy}>
                {busy ? 'Sealing…' : 'Close and seal assessment'}
              </Button>
            </Card>
          ) : (
            <Card>
              <h2 className="mb-2 font-serif text-lg text-ink">Cryptographic seal</h2>
              <div className="space-y-1 text-sm">
                <div><span className="text-muted">Algorithm:</span> <span className="text-ink">{caseFile.sealAlgorithm}</span></div>
                <div className="break-all"><span className="text-muted">Hash:</span> <span className="text-ink">{caseFile.sealHash}</span></div>
                <div><span className="text-muted">Timestamp authority:</span> <span className="text-ink">{caseFile.sealTimestampAuthority}</span></div>
                <div><span className="text-muted">Sealed at:</span> <span className="text-ink">{caseFile.sealTimestampTime && new Date(caseFile.sealTimestampTime).toLocaleString()}</span></div>
              </div>

              {!showReopenForm ? (
                <Button variant="secondary" className="mt-4" onClick={() => setShowReopenForm(true)} disabled={busy}>
                  Reopen assessment (breaks seal)
                </Button>
              ) : (
                <div className="mt-4 rounded-lg border border-alert/30 bg-alert/5 p-3">
                  <Label htmlFor="reopenReason">Why are you reopening this sealed assessment?</Label>
                  <Textarea
                    id="reopenReason"
                    rows={2}
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="e.g. A hazard rating needs correcting before the report goes to the board"
                  />
                  <p className="mt-1 text-xs text-muted">
                    This reason, your name, and the current seal are recorded permanently in this assessment's
                    history and shown in the exported PDF, reopening isn't undone silently.
                  </p>
                  {reopenError && <p className="mt-2 text-sm text-destructive">{reopenError}</p>}
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => { setShowReopenForm(false); setReopenReason(''); setReopenError('') }}
                      disabled={busy}
                    >
                      Cancel
                    </Button>
                    <Button onClick={reopenCase} disabled={busy || !reopenReason.trim()}>
                      {busy ? 'Reopening…' : 'Confirm reopen'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {(caseFile.sealHistory?.length ?? 0) > 0 && (
            <Card>
              <div className="mb-3 flex items-center gap-2">
                <History size={16} className="text-muted" />
                <h2 className="font-serif text-lg text-ink">Seal history</h2>
              </div>
              <div className="space-y-3">
                {[...(caseFile.sealHistory ?? [])].reverse().map((e) => (
                  <div key={e.id} className="border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <Badge tone={e.eventType === 'sealed' ? 'success' : 'alert'}>
                        {e.eventType === 'sealed' ? 'Sealed' : 'Reopened'}
                      </Badge>
                      <span className="text-xs text-muted">{new Date(e.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 text-ink">
                      {e.eventType === 'sealed' ? 'Sealed' : 'Reopened'} by {e.userName || 'a team member'}
                    </div>
                    {e.eventType === 'reopened' && e.reason && (
                      <div className="mt-0.5 text-muted">Reason: "{e.reason}"</div>
                    )}
                    {e.sealHash && (
                      <div className="mt-0.5 break-all text-xs text-muted">
                        {e.eventType === 'sealed' ? 'Seal' : 'Broke seal'}: {e.sealHash}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function NextStepButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="flex justify-end">
      <Button variant="secondary" onClick={onClick}>
        Next: {label} <ArrowRight size={16} />
      </Button>
    </div>
  )
}
