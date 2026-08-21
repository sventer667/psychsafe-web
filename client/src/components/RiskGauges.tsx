import { Card } from './ui/Card'
import type { RiskGauges as RiskGaugesData } from '../lib/types'

// Semi-circle risk gauges, an original SVG implementation (not a charting
// library), rendered as a two-up summary above the category heat-map on the
// dashboard. Band thresholds (24% / 48%) intentionally match the low/moderate/
// high cutoffs used everywhere else in the app (riskRating 6 and 12 out of a
// possible 25), so a gauge's colour always agrees with a hazard's own badge.

const MAX_RISK_RATING = 25
const LOW_BAND_END = (6 / MAX_RISK_RATING) * 100 // 24%
const MODERATE_BAND_END = (12 / MAX_RISK_RATING) * 100 // 48%

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

// Arc from `startPct` to `endPct` (0-100, left to right across the gauge),
// drawn along the top semicircle of radius r centred at (cx, cy).
function describeArc(cx: number, cy: number, r: number, startPct: number, endPct: number) {
  const startAngle = 180 - (startPct / 100) * 180
  const endAngle = 180 - (endPct / 100) * 180
  const start = polarToCartesian(cx, cy, r, startAngle)
  const end = polarToCartesian(cx, cy, r, endAngle)
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`
}

function toneLabel(pct: number) {
  if (pct >= MODERATE_BAND_END) return { label: 'High Risk', className: 'text-destructive' }
  if (pct >= LOW_BAND_END) return { label: 'Moderate Risk', className: 'text-alert' }
  return { label: 'Low Risk', className: 'text-success' }
}

function Gauge({ title, pct, score, hazardCount }: { title: string; pct: number; score: number; hazardCount: number }) {
  const cx = 100
  const cy = 90
  const r = 76
  const strokeWidth = 16
  const tone = toneLabel(pct)
  const needleAngle = 180 - (pct / 100) * 180
  const needleLength = r - strokeWidth / 2 - 4
  const needleTip = polarToCartesian(cx, cy, needleLength, needleAngle)

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mb-1 text-center text-sm font-medium text-ink">{title}</div>
      <svg viewBox="0 0 200 110" className="w-full max-w-[220px]">
        <path
          d={describeArc(cx, cy, r, 0, LOW_BAND_END)}
          fill="none"
          stroke="var(--color-success)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={describeArc(cx, cy, r, LOW_BAND_END, MODERATE_BAND_END)}
          fill="none"
          stroke="var(--color-alert)"
          strokeWidth={strokeWidth}
        />
        <path
          d={describeArc(cx, cy, r, MODERATE_BAND_END, 100)}
          fill="none"
          stroke="var(--color-destructive)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="var(--color-ink)" strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill="var(--color-ink)" />
        <text x={cx} y={cy - 22} textAnchor="middle" className="fill-ink font-serif text-2xl font-semibold">
          {pct}%
        </text>
      </svg>
      <p className="mt-1 text-center text-xs text-muted">
        {pct}% of maximum possible risk score
        <br />
        Connexus risk score: {score} / 25 · <span className={tone.className}>{tone.label}</span>
      </p>
      <p className="mt-0.5 text-center text-xs text-muted">
        Averaged across {hazardCount} open hazard{hazardCount === 1 ? '' : 's'}
      </p>
    </div>
  )
}

export function RiskGauges({ data }: { data: RiskGaugesData }) {
  if (data.hazardCount === 0) {
    return (
      <Card>
        <h2 className="mb-1 font-serif text-lg text-ink">Psychosocial risk rating</h2>
        <p className="text-sm text-muted">
          These gauges fill in once you've logged hazards against an open assessment: one for the inherent risk you
          rated at the time, and one for the residual risk once you've re-rated a hazard after applying controls.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-2">
        <h2 className="font-serif text-lg text-ink">Psychosocial risk rating</h2>
        <p className="text-sm text-muted">Average risk score across every open hazard in your open assessments</p>
      </div>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Gauge title="Inherent Psychosocial Risk Rating" pct={data.inherentPct} score={data.inherentScore} hazardCount={data.hazardCount} />
        <Gauge title="Residual Psychosocial Risk Rating" pct={data.residualPct} score={data.residualScore} hazardCount={data.hazardCount} />
      </div>
      <p className="mt-3 text-xs text-muted">
        Inherent reflects the rating given when each hazard was logged. Residual reflects the rating after controls,
        for hazards that have been re-rated, other hazards count at their inherent score until re-rated from the
        Hazard Register.
      </p>
    </Card>
  )
}
