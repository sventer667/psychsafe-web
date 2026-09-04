import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, ClipboardList, X } from 'lucide-react'
import { Card, Badge } from '../ui/Card'
import { Button } from '../ui/Button'
import { Label, Select, Textarea } from '../ui/Input'
import type { ActionItem, ActionStatus, ControlEffectiveness, Hazard, HazardLibraryEntry } from '../../lib/types'
import { ApiError } from '../../lib/api'

const EFFECTIVENESS_LABEL: Record<ControlEffectiveness, string> = {
  not_evaluated: 'Not yet evaluated',
  not_effective: 'Not effective',
  partially_effective: 'Partially effective',
  effective: 'Effective',
}

const EFFECTIVENESS_TONE: Record<ControlEffectiveness, 'default' | 'accent' | 'destructive' | 'success' | 'alert'> = {
  not_evaluated: 'default',
  not_effective: 'destructive',
  partially_effective: 'alert',
  effective: 'success',
}

const ACTION_STATUS_LABEL: Record<ActionStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  verification_pending: 'Verification Pending',
  complete: 'Complete',
  closed: 'Closed',
}

const ACTION_STATUS_TONE: Record<ActionStatus, 'default' | 'accent' | 'destructive' | 'success' | 'alert'> = {
  pending: 'default',
  in_progress: 'accent',
  verification_pending: 'alert',
  complete: 'success',
  closed: 'default',
}

function ratingTone(rating: number) {
  if (rating >= 12) return 'destructive' as const
  if (rating >= 6) return 'alert' as const
  return 'success' as const
}

function ratingLabel(rating: number) {
  if (rating >= 12) return 'High'
  if (rating >= 6) return 'Moderate'
  return 'Low'
}

// Plain-English descriptors so people rating a hazard don't need to already
// know how to read a risk matrix. Each option maps to the 1-5 scale the
// backend expects, but nobody has to guess what "3" means.
const LIKELIHOOD_OPTIONS = [
  { value: 1, label: 'Rare', hint: 'Very unlikely to happen, given current controls' },
  { value: 2, label: 'Unlikely', hint: 'Could happen, but there\'s no reason to expect it soon' },
  { value: 3, label: 'Possible', hint: 'Might happen at some point, there\'s a real chance it does' },
  { value: 4, label: 'Likely', hint: 'Will probably happen, or already happening occasionally' },
  { value: 5, label: 'Almost certain', hint: 'Expected to happen, or is happening regularly right now' },
]

const CONSEQUENCE_OPTIONS = [
  { value: 1, label: 'Minimal', hint: 'Little to no impact on wellbeing, passes quickly' },
  { value: 2, label: 'Minor', hint: 'Mild, short-term stress; no real disruption to work' },
  { value: 3, label: 'Moderate', hint: 'Noticeable psychological strain; may need time off or support' },
  { value: 4, label: 'Major', hint: 'Significant harm, such as extended leave, treatment, or lasting impact' },
  { value: 5, label: 'Severe', hint: 'Serious, potentially long-term psychological injury' },
]

export function HazardRegisterTab({
  hazards,
  library,
  actionItems,
  assessmentState,
  readOnly,
  onAdd,
  onAddAction,
  onSetResidual,
  onUpdateBasis,
  onAddExistingControl,
  onDeleteExistingControl,
  highlightCategory = '',
}: {
  hazards: Hazard[]
  library: HazardLibraryEntry[]
  actionItems: ActionItem[]
  assessmentState: string
  readOnly: boolean
  onAdd: (
    entry: HazardLibraryEntry,
    likelihood: number,
    consequence: number,
    basis: { evidence: string; exposureDetail: string; affectedWorkers: string }
  ) => Promise<void>
  onAddAction: (hazard: Hazard, title: string) => Promise<void>
  onSetResidual: (hazard: Hazard, residualLikelihood: number, residualConsequence: number) => Promise<void>
  onUpdateBasis: (
    hazard: Hazard,
    basis: { evidence: string; exposureDetail: string; affectedWorkers: string }
  ) => Promise<void>
  onAddExistingControl: (hazard: Hazard, description: string, effectiveness: string) => Promise<void>
  onDeleteExistingControl: (hazard: Hazard, controlId: number) => Promise<void>
  highlightCategory?: string
}) {
  const [showLibrary, setShowLibrary] = useState(!!highlightCategory)
  const [expandedHazard, setExpandedHazard] = useState<number | null>(null)
  const [pickerId, setPickerId] = useState<number | null>(null)
  const [likelihood, setLikelihood] = useState(3)
  const [consequence, setConsequence] = useState(3)
  const [evidence, setEvidence] = useState('')
  const [exposureDetail, setExposureDetail] = useState('')
  const [affectedWorkers, setAffectedWorkers] = useState('')
  const [busy, setBusy] = useState(false)
  const [addingAction, setAddingAction] = useState<string | null>(null)
  const [residualLikelihood, setResidualLikelihood] = useState(3)
  const [residualConsequence, setResidualConsequence] = useState(3)
  const [savingResidual, setSavingResidual] = useState(false)
  const [residualError, setResidualError] = useState('')
  const [basisEvidence, setBasisEvidence] = useState('')
  const [basisExposure, setBasisExposure] = useState('')
  const [basisAffected, setBasisAffected] = useState('')
  const [savingBasis, setSavingBasis] = useState(false)
  const [basisSaved, setBasisSaved] = useState(false)
  const [newControlDesc, setNewControlDesc] = useState('')
  const [newControlEffectiveness, setNewControlEffectiveness] = useState<string>('not_evaluated')
  const [savingControl, setSavingControl] = useState(false)

  function toggleExpanded(h: Hazard) {
    const expanding = expandedHazard !== h.id
    setExpandedHazard(expanding ? h.id : null)
    setResidualError('')
    setBasisSaved(false)
    if (expanding) {
      setResidualLikelihood(h.residualLikelihood ?? h.likelihood)
      setResidualConsequence(h.residualConsequence ?? h.consequence)
      setBasisEvidence(h.evidence || '')
      setBasisExposure(h.exposureDetail || '')
      setBasisAffected(h.affectedWorkers || '')
      setNewControlDesc('')
      setNewControlEffectiveness('not_evaluated')
    }
  }

  async function confirmResidual(h: Hazard) {
    setSavingResidual(true)
    setResidualError('')
    try {
      await onSetResidual(h, residualLikelihood, residualConsequence)
    } catch (err) {
      setResidualError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setSavingResidual(false)
    }
  }

  async function saveBasis(h: Hazard) {
    setSavingBasis(true)
    setBasisSaved(false)
    try {
      await onUpdateBasis(h, { evidence: basisEvidence, exposureDetail: basisExposure, affectedWorkers: basisAffected })
      setBasisSaved(true)
    } finally {
      setSavingBasis(false)
    }
  }

  async function confirmAddControl(h: Hazard) {
    if (!newControlDesc.trim()) return
    setSavingControl(true)
    try {
      await onAddExistingControl(h, newControlDesc.trim(), newControlEffectiveness)
      setNewControlDesc('')
      setNewControlEffectiveness('not_evaluated')
    } finally {
      setSavingControl(false)
    }
  }

  const addedLibraryIds = new Set(hazards.map((h) => h.hazardLibraryId).filter(Boolean))
  const byCategory = library.reduce<Record<string, HazardLibraryEntry[]>>((acc, e) => {
    ;(acc[e.category] ??= []).push(e)
    return acc
  }, {})

  async function confirmAdd(entry: HazardLibraryEntry) {
    setBusy(true)
    try {
      await onAdd(entry, likelihood, consequence, { evidence, exposureDetail, affectedWorkers })
      setPickerId(null)
      setLikelihood(3)
      setConsequence(3)
      setEvidence('')
      setExposureDetail('')
      setAffectedWorkers('')
    } finally {
      setBusy(false)
    }
  }

  async function confirmAddAction(hazard: Hazard, controlText: string) {
    setAddingAction(controlText)
    try {
      // Recommended-control text is often a full sentence with an "Eliminate: ..."
      // style prefix, so trim it to a sensible action-item title.
      const title = controlText.length > 90 ? controlText.slice(0, 87) + 'â¦' : controlText
      await onAddAction(hazard, title)
    } finally {
      setAddingAction(null)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg text-ink">Hazard Register</h2>
          <p className="text-sm text-muted">{hazards.length} hazard{hazards.length === 1 ? '' : 's'} in this assessment</p>
        </div>
        {!readOnly && (
          <Button onClick={() => setShowLibrary((v) => !v)}>
            <Plus size={16} /> Add from library
          </Button>
        )}
      </div>

      {showLibrary && !readOnly && (
        <Card className="mb-6">
          <p className="mb-3 text-sm text-muted">
            Draws from a built-in reference library aligned to WHS codes of practice nationwide. Each hazard is paired
            with the relevant legislation for your state or territory and a staged pathway of controls, from removing
            the hazard entirely through to individual support.
          </p>
          <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
            {Object.entries(byCategory).map(([category, entries]) => (
              <div key={category}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{category}</div>
                <div className="space-y-2">
                  {entries.map((entry) => {
                    const alreadyAdded = addedLibraryIds.has(entry.id)
                    return (
                      <div key={entry.id} className="rounded-xl border border-border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-ink">{entry.name}</div>
                            <div className="text-xs text-muted">{entry.description}</div>
                          </div>
                          {alreadyAdded ? (
                            <Badge tone="default">Added</Badge>
                          ) : (
                            <Button
                              variant="secondary"
                              className="whitespace-nowrap"
                              onClick={() => setPickerId(pickerId === entry.id ? null : entry.id)}
                            >
                              {pickerId === entry.id ? 'Cancel' : 'Add'}
                            </Button>
                          )}
                        </div>
                        {pickerId === entry.id && (
                          <div className="mt-3 space-y-3 border-t border-border pt-3">
                            <p className="text-xs text-muted">
                              Rate this hazard as it stands today, with whatever controls are already in place. No prior
                              risk-assessment experience needed, just pick the description that fits best.
                            </p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <Label htmlFor={`l-${entry.id}`}>How likely is it to happen?</Label>
                                <Select
                                  id={`l-${entry.id}`}
                                  value={likelihood}
                                  onChange={(e) => setLikelihood(Number(e.target.value))}
                                >
                                  {LIKELIHOOD_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </Select>
                                <p className="mt-1 text-xs text-muted">
                                  {LIKELIHOOD_OPTIONS.find((o) => o.value === likelihood)?.hint}
                                </p>
                              </div>
                              <div>
                                <Label htmlFor={`c-${entry.id}`}>How serious would the impact be?</Label>
                                <Select
                                  id={`c-${entry.id}`}
                                  value={consequence}
                                  onChange={(e) => setConsequence(Number(e.target.value))}
                                >
                                  {CONSEQUENCE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </Select>
                                <p className="mt-1 text-xs text-muted">
                                  {CONSEQUENCE_OPTIONS.find((o) => o.value === consequence)?.hint}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2 border-t border-border pt-3">
                              <p className="text-xs text-muted">
                                Optional, but this is what turns a rating into something you can defend to a
                                regulator or the board: what told you this is a risk here, how workers actually
                                encounter it, and who.
                              </p>
                              <div>
                                <Label htmlFor={`ev-${entry.id}`}>Evidence (what told you this is a risk here?)</Label>
                                <Textarea
                                  id={`ev-${entry.id}`}
                                  rows={2}
                                  value={evidence}
                                  onChange={(e) => setEvidence(e.target.value)}
                                  placeholder="e.g. Staff survey results, exit interview themes, WHS incident reports, consultation feedback"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`ex-${entry.id}`}>Exposure (how and when are workers exposed?)</Label>
                                <Textarea
                                  id={`ex-${entry.id}`}
                                  rows={2}
                                  value={exposureDetail}
                                  onChange={(e) => setExposureDetail(e.target.value)}
                                  placeholder="e.g. Daily during peak shift, ongoing for the duration of a project, one-off during restructure"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`aw-${entry.id}`}>Affected workers (who, and how many?)</Label>
                                <Textarea
                                  id={`aw-${entry.id}`}
                                  rows={2}
                                  value={affectedWorkers}
                                  onChange={(e) => setAffectedWorkers(e.target.value)}
                                  placeholder="e.g. All 12 warehouse pickers on night shift, or the finance team of 4"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-2 text-sm text-muted">
                                Estimated risk:
                                <Badge tone={ratingTone(likelihood * consequence)}>
                                  {ratingLabel(likelihood * consequence)} ({likelihood * consequence})
                                </Badge>
                              </div>
                              <Button onClick={() => confirmAdd(entry)} disabled={busy}>
                                {busy ? 'Addingâ¦' : 'Confirm'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {highlightCategory && (
        <p className="mb-3 text-sm text-muted">
          Showing hazards from the <span className="text-ink">{highlightCategory}</span> category, flagged from your
          dashboard heat-map.
        </p>
      )}

      <div className="space-y-3">
        {hazards.map((h) => {
          const libEntry = library.find((l) => l.id === h.hazardLibraryId)
          const expanded = expandedHazard === h.id
          const matchesHighlight = highlightCategory && h.category === highlightCategory
          const linkedActions = actionItems.filter((a) => a.hazardId === h.id)
          const existingActionTitles = new Set(linkedActions.map((a) => a.title))
          return (
            <Card key={h.id} className={matchesHighlight ? 'ring-1 ring-accent' : ''}>
              <button className="flex w-full items-start justify-between text-left" onClick={() => toggleExpanded(h)}>
                <div>
                  <div className="font-medium text-ink">{h.title}</div>
                  <div className="text-sm text-muted">{h.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  {linkedActions.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <ClipboardList size={12} /> {linkedActions.length} action{linkedActions.length === 1 ? '' : 's'}
                    </span>
                  )}
                  <Badge tone={ratingTone(h.riskRating)}>Current {h.riskRating}</Badge>
                  {h.residualRiskRating !== null && (
                    <Badge tone={ratingTone(h.residualRiskRating)}>Residual {h.residualRiskRating}</Badge>
                  )}
                  {expanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                </div>
              </button>
              {h.description && <p className="mt-2 text-sm text-muted">{h.description}</p>}

              {expanded && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                      Assessment basis
                    </div>
                    {readOnly ? (
                      <div className="space-y-2 text-sm">
                        <div><span className="text-muted">Evidence:</span> <span className="text-ink">{h.evidence || 'Not recorded'}</span></div>
                        <div><span className="text-muted">Exposure:</span> <span className="text-ink">{h.exposureDetail || 'Not recorded'}</span></div>
                        <div><span className="text-muted">Affected workers:</span> <span className="text-ink">{h.affectedWorkers || 'Not recorded'}</span></div>
                      </div>
                    ) : (
                      <div className="space-y-2 rounded-xl border border-border p-3">
                        <div>
                          <Label htmlFor={`bev-${h.id}`}>Evidence (what told you this is a risk here?)</Label>
                          <Textarea id={`bev-${h.id}`} rows={2} value={basisEvidence} onChange={(e) => setBasisEvidence(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor={`bex-${h.id}`}>Exposure (how and when are workers exposed?)</Label>
                          <Textarea id={`bex-${h.id}`} rows={2} value={basisExposure} onChange={(e) => setBasisExposure(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor={`baw-${h.id}`}>Affected workers (who, and how many?)</Label>
                          <Textarea id={`baw-${h.id}`} rows={2} value={basisAffected} onChange={(e) => setBasisAffected(e.target.value)} />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {basisSaved && !savingBasis && <span className="text-xs text-success">Saved</span>}
                          <Button variant="secondary" onClick={() => saveBasis(h)} disabled={savingBasis}>
                            {savingBasis ? 'Savingâ¦' : 'Save assessment basis'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                      Existing controls (already in place, before this assessment)
                    </div>
                    {h.existingControls.length > 0 ? (
                      <div className="mb-3 space-y-1.5">
                        {h.existingControls.map((c) => (
                          <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                            <span className="text-ink">{c.description}</span>
                            <div className="flex shrink-0 items-center gap-2">
                              <Badge tone={EFFECTIVENESS_TONE[c.effectiveness]}>{EFFECTIVENESS_LABEL[c.effectiveness]}</Badge>
                              {!readOnly && (
                                <button
                                  onClick={() => onDeleteExistingControl(h, c.id)}
                                  className="text-muted hover:text-destructive"
                                  aria-label="Remove existing control"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mb-3 text-sm text-muted">
                        Nothing logged yet. Recording what's already in place, and how well it's actually working,
                        shows a reviewer this rating accounts for existing controls rather than treating the hazard
                        as if nothing has been done.
                      </p>
                    )}
                    {!readOnly && (
                      <div className="space-y-2 rounded-xl border border-border p-3">
                        <div>
                          <Label htmlFor={`nc-${h.id}`}>Add an existing control</Label>
                          <Textarea
                            id={`nc-${h.id}`}
                            rows={2}
                            value={newControlDesc}
                            onChange={(e) => setNewControlDesc(e.target.value)}
                            placeholder="e.g. Fortnightly 1:1 check-ins between team leads and direct reports"
                          />
                        </div>
                        <div className="flex items-end justify-between gap-3">
                          <div className="flex-1">
                            <Label htmlFor={`nce-${h.id}`}>How effective is it?</Label>
                            <Select
                              id={`nce-${h.id}`}
                              value={newControlEffectiveness}
                              onChange={(e) => setNewControlEffectiveness(e.target.value)}
                            >
                              {(Object.keys(EFFECTIVENESS_LABEL) as ControlEffectiveness[]).map((v) => (
                                <option key={v} value={v}>{EFFECTIVENESS_LABEL[v]}</option>
                              ))}
                            </Select>
                          </div>
                          <Button onClick={() => confirmAddControl(h)} disabled={savingControl || !newControlDesc.trim()}>
                            {savingControl ? 'Addingâ¦' : 'Add control'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {libEntry && (
                    <div>
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                        Recommended actions (hierarchy of controls)
                      </div>
                      <ol className="list-decimal space-y-2 pl-5 text-sm text-ink">
                        {libEntry.controls.map((c, i) => {
                          const alreadyLinked = existingActionTitles.has(c) || existingActionTitles.has(c.slice(0, 87) + 'â¦')
                          return (
                            <li key={i} className="flex items-start justify-between gap-3">
                              <span>{c}</span>
                              {!readOnly &&
                                (alreadyLinked ? (
                                  <Badge tone="default">Added</Badge>
                                ) : (
                                  <button
                                    onClick={() => confirmAddAction(h, c)}
                                    disabled={addingAction === c}
                                    className="shrink-0 whitespace-nowrap text-xs font-medium text-accent hover:underline disabled:opacity-50"
                                  >
                                    {addingAction === c ? 'Addingâ¦' : '+ Add to action plan'}
                                  </button>
                                ))}
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  )}

                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                      Linked action plan items
                    </div>
                    {linkedActions.length > 0 ? (
                      <div className="space-y-1.5">
                        {linkedActions.map((a) => (
                          <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                            <span className="text-ink">{a.title}</span>
                            <Badge tone={ACTION_STATUS_TONE[a.status]}>{ACTION_STATUS_LABEL[a.status]}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted">
                        No action items linked to this hazard yet. Add one of the recommended actions above, or create a
                        custom one from the Action Plan tab.
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                      Residual risk (after controls)
                    </div>
                    {(() => {
                      const hasVerifiedControl = linkedActions.some((a) => a.status === 'complete' || a.status === 'closed')
                      return (
                        <>
                          {h.residualRatedAt && (
                            <p className="mb-2 text-sm text-muted">
                              Last re-rated {new Date(h.residualRatedAt).toLocaleDateString()}. Update it below if the
                              situation has changed.
                            </p>
                          )}
                          {!h.residualRatedAt && hasVerifiedControl && (
                            <p className="mb-2 text-sm text-muted">
                              Not yet re-rated. Until you do, this hazard counts at its current-risk score on the
                              dashboard's residual risk gauge.
                            </p>
                          )}
                          {!hasVerifiedControl && (
                            <p className="mb-2 text-sm text-muted">
                              Re-rating unlocks once at least one linked action for this hazard has been marked
                              Complete, so residual risk reflects a control that's actually been implemented, not
                              just planned.
                            </p>
                          )}
                          {!readOnly && hasVerifiedControl && (
                            <div className="space-y-3 rounded-xl border border-border p-3">
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                  <Label htmlFor={`rl-${h.id}`}>How likely is it now, with controls in place?</Label>
                                  <Select
                                    id={`rl-${h.id}`}
                                    value={residualLikelihood}
                                    onChange={(e) => setResidualLikelihood(Number(e.target.value))}
                                  >
                                    {LIKELIHOOD_OPTIONS.map((o) => (
                                      <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor={`rc-${h.id}`}>How serious would the impact be now?</Label>
                                  <Select
                                    id={`rc-${h.id}`}
                                    value={residualConsequence}
                                    onChange={(e) => setResidualConsequence(Number(e.target.value))}
                                  >
                                    {CONSEQUENCE_OPTIONS.map((o) => (
                                      <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                  </Select>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2 text-sm text-muted">
                                  Residual risk:
                                  <Badge tone={ratingTone(residualLikelihood * residualConsequence)}>
                                    {ratingLabel(residualLikelihood * residualConsequence)} ({residualLikelihood * residualConsequence})
                                  </Badge>
                                </div>
                                <Button onClick={() => confirmResidual(h)} disabled={savingResidual}>
                                  {savingResidual ? 'Savingâ¦' : 'Save residual rating'}
                                </Button>
                              </div>
                              {residualError && <p className="text-sm text-destructive">{residualError}</p>}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>

                  {libEntry && (
                    <div>
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                        Applicable legislation {assessmentState && `(${assessmentState})`}
                      </div>
                      <p className="text-sm text-ink">
                        {assessmentState
                          ? libEntry.legislation[assessmentState]
                          : 'Set this assessment\'s state/territory on the Details tab to see the relevant citation.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
        {hazards.length === 0 && <p className="text-sm text-muted">No hazards added yet.</p>}
      </div>
    </div>
  )
}
