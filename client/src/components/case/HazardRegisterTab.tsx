import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'
import { Card, Badge } from '../ui/Card'
import { Button } from '../ui/Button'
import { Label, Select } from '../ui/Input'
import type { ActionItem, ActionStatus, Hazard, HazardLibraryEntry } from '../../lib/types'

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
  highlightCategory = '',
}: {
  hazards: Hazard[]
  library: HazardLibraryEntry[]
  actionItems: ActionItem[]
  assessmentState: string
  readOnly: boolean
  onAdd: (entry: HazardLibraryEntry, likelihood: number, consequence: number) => Promise<void>
  onAddAction: (hazard: Hazard, title: string) => Promise<void>
  onSetResidual: (hazard: Hazard, residualLikelihood: number, residualConsequence: number) => Promise<void>
  highlightCategory?: string
}) {
  const [showLibrary, setShowLibrary] = useState(!!highlightCategory)
  const [expandedHazard, setExpandedHazard] = useState<number | null>(null)
  const [pickerId, setPickerId] = useState<number | null>(null)
  const [likelihood, setLikelihood] = useState(3)
  const [consequence, setConsequence] = useState(3)
  const [busy, setBusy] = useState(false)
  const [addingAction, setAddingAction] = useState<string | null>(null)
  const [residualLikelihood, setResidualLikelihood] = useState(3)
  const [residualConsequence, setResidualConsequence] = useState(3)
  const [savingResidual, setSavingResidual] = useState(false)

  function toggleExpanded(h: Hazard) {
    const expanding = expandedHazard !== h.id
    setExpandedHazard(expanding ? h.id : null)
    if (expanding) {
      setResidualLikelihood(h.residualLikelihood ?? h.likelihood)
      setResidualConsequence(h.residualConsequence ?? h.consequence)
    }
  }

  async function confirmResidual(h: Hazard) {
    setSavingResidual(true)
    try {
      await onSetResidual(h, residualLikelihood, residualConsequence)
    } finally {
      setSavingResidual(false)
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
      await onAdd(entry, likelihood, consequence)
      setPickerId(null)
      setLikelihood(3)
      setConsequence(3)
    } finally {
      setBusy(false)
    }
  }

  async function confirmAddAction(hazard: Hazard, controlText: string) {
    setAddingAction(controlText)
    try {
      // Recommended-control text is often a full sentence with an "Eliminate: ..."
      // style prefix, so trim it to a sensible action-item title.
      const title = controlText.length > 90 ? controlText.slice(0, 87) + '…' : controlText
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
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-2 text-sm text-muted">
                                Estimated risk:
                                <Badge tone={ratingTone(likelihood * consequence)}>
                                  {ratingLabel(likelihood * consequence)} ({likelihood * consequence})
                                </Badge>
                              </div>
                              <Button onClick={() => confirmAdd(entry)} disabled={busy}>
                                {busy ? 'Adding…' : 'Confirm'}
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
                  <Badge tone={ratingTone(h.riskRating)}>Inherent {h.riskRating}</Badge>
                  {h.residualRiskRating !== null && (
                    <Badge tone={ratingTone(h.residualRiskRating)}>Residual {h.residualRiskRating}</Badge>
                  )}
                  {expanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                </div>
              </button>
              {h.description && <p className="mt-2 text-sm text-muted">{h.description}</p>}

              {expanded && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  {libEntry && (
                    <div>
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                        Recommended actions (hierarchy of controls)
                      </div>
                      <ol className="list-decimal space-y-2 pl-5 text-sm text-ink">
                        {libEntry.controls.map((c, i) => {
                          const alreadyLinked = existingActionTitles.has(c) || existingActionTitles.has(c.slice(0, 87) + '…')
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
                                    {addingAction === c ? 'Adding…' : '+ Add to action plan'}
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
                    {h.residualRatedAt ? (
                      <p className="mb-2 text-sm text-muted">
                        Last re-rated {new Date(h.residualRatedAt).toLocaleDateString()}. Update it below if the
                        situation has changed.
                      </p>
                    ) : (
                      <p className="mb-2 text-sm text-muted">
                        Not yet re-rated. Until you do, this hazard counts at its inherent score on the dashboard's
                        residual risk gauge.
                      </p>
                    )}
                    {!readOnly && (
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
                            {savingResidual ? 'Saving…' : 'Save residual rating'}
                          </Button>
                        </div>
                      </div>
                    )}
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
