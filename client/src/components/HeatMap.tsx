import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import type { Heatmap } from '../lib/types'

// RAG (red/amber/green) rating bands, matching the risk-rating scale used
// elsewhere in the app (likelihood x consequence, 1-25).
function tone(maxRating: number, hazardCount: number) {
  if (hazardCount === 0) return 'none' as const
  if (maxRating >= 12) return 'red' as const
  if (maxRating >= 6) return 'amber' as const
  return 'green' as const
}

const TONE_CLASSES: Record<string, string> = {
  none: 'bg-surface-raised text-muted border-border',
  green: 'bg-success/20 text-success border-success/40 hover:bg-success/30',
  amber: 'bg-alert/20 text-alert border-alert/40 hover:bg-alert/30',
  red: 'bg-destructive/20 text-destructive border-destructive/40 hover:bg-destructive/30',
}

export function HeatMap({ data }: { data: Heatmap }) {
  const navigate = useNavigate()
  const { cases, categories, cells } = data

  if (cases.length === 0) {
    return (
      <Card>
        <h2 className="mb-1 font-serif text-lg text-ink">Psychosocial risk heat-map</h2>
        <p className="mb-4 text-sm text-muted">
          This grid lights up red/amber/green once you've opened an assessment and logged hazards against it. It'll
          show your highest risk score per category, per assessment.
        </p>
        <Button onClick={() => navigate('/cases')}>
          <Plus size={16} /> Start your first assessment
        </Button>
      </Card>
    )
  }

  const cellFor = (caseId: number, category: string) => cells.find((c) => c.caseId === caseId && c.category === category)

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg text-ink">Psychosocial risk heat-map</h2>
          <p className="text-sm text-muted">Highest current risk rating per hazard category, across your open assessments</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-success" /> Low</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-alert" /> Moderate</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-destructive" /> High</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="p-1 text-left text-xs font-medium uppercase tracking-wide text-muted">Category</th>
              {cases.map((c) => (
                <th key={c.id} className="p-1 text-center text-xs font-medium text-muted">
                  <span className="line-clamp-1">{c.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category}>
                <td className="whitespace-nowrap p-1 pr-3 text-sm text-ink">{category}</td>
                {cases.map((c) => {
                  const cell = cellFor(c.id, category)
                  const t = tone(cell?.maxRating ?? 0, cell?.hazardCount ?? 0)
                  return (
                    <td key={c.id} className="p-1">
                      <button
                        onClick={() =>
                          navigate(`/cases/${c.id}?tab=Hazard%20Register&category=${encodeURIComponent(category)}`)
                        }
                        className={`flex h-14 w-full min-w-[64px] flex-col items-center justify-center rounded-lg border text-xs font-medium transition ${TONE_CLASSES[t]}`}
                        title={
                          cell && cell.hazardCount > 0
                            ? `${cell.hazardCount} hazard${cell.hazardCount === 1 ? '' : 's'}, highest risk score ${cell.maxRating}`
                            : 'No hazards logged in this category'
                        }
                      >
                        {cell && cell.hazardCount > 0 ? (
                          <>
                            <span className="text-base font-serif">{cell.maxRating}</span>
                            <span className="opacity-80">{cell.hazardCount} hazard{cell.hazardCount === 1 ? '' : 's'}</span>
                          </>
                        ) : (
                          <span>—</span>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
