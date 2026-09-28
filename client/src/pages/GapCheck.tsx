import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input, Label, Select } from '../components/ui/Input'
import { api, ApiError } from '../lib/api'

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']
const INDUSTRIES = [
  'Construction',
  'Education',
  'Emergency Services',
  'Healthcare & Aged Care',
  'Mining & Resources',
  'Transport & Logistics',
  'Other',
]
const SIZES = ['1-19', '20-99', '100-499', '500+']

const CURRENT_SETUP_OPTIONS = [
  'Nothing formal yet',
  'A written policy, but no ongoing process',
  'An annual survey or one-off assessment',
  'Spreadsheets or shared documents',
  'An external consultant',
  'A system like this one',
]

const STEP3_QUESTIONS = [
  'Do you have a documented register of specific psychosocial hazards, not just a general policy?',
  'For each hazard, is there something dated behind the rating, such as an incident, a survey result, or consultation feedback, rather than just a number someone assigned?',
  'Are your controls assigned to a named person with a due date, and could you say right now which ones are overdue?',
  'Have you consulted with workers or their representatives about these risks, and kept a record of it?',
  'Has any of this been reviewed or reassessed in the last 12 months?',
  'If an inspector asked today, could you hand over something dated and specific within five minutes?',
]

type Tier = 'solid' | 'partial' | 'high'

const TIER_COPY: Record<Tier, { headline: string; body: string }> = {
  solid: {
    headline: 'Solid foundation, one gap worth closing',
    body: "You're doing more than most organisations we see. There's one area that could use attention before it becomes a problem. We've included it in your full breakdown below.",
  },
  partial: {
    headline: 'Partial coverage, several gaps to close',
    body: "You have some of what's expected, but there are real gaps that would likely surface under any real scrutiny. Your full breakdown below shows exactly what's missing and why it matters.",
  },
  high: {
    headline: 'High exposure, no defensible record right now',
    body: "Based on your answers, you don't currently have something that would hold up if asked. That's a common starting point, not a verdict on your organisation, and it's fixable. Your full breakdown shows exactly where to start.",
  },
}

function computeTier(answers: (boolean | null)[]): Tier {
  const noCount = answers.filter((a) => a === false).length
  if (noCount <= 1) return 'solid'
  if (noCount <= 4) return 'partial'
  return 'high'
}

type Screen = 'landing' | 1 | 2 | 3 | 4 | 5 | 6

interface SubmitResponse {
  id: number
  tier: Tier
  tierLabel: string
  pdfUrl: string
}

export function GapCheck() {
  const [screen, setScreen] = useState<Screen>('landing')

  // Step 1
  const [state, setState] = useState('')
  const [industry, setIndustry] = useState('')
  const [orgSize, setOrgSize] = useState('')

  // Step 2 (informational only, not scored, but sent along for context)
  const [currentSetup, setCurrentSetup] = useState<string[]>([])

  // Step 3
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null, null, null, null])

  // Step 5
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<SubmitResponse | null>(null)

  function toggleSetup(option: string) {
    setCurrentSetup((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]))
  }

  function setAnswer(index: number, value: boolean) {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const tier = computeTier(answers)

  async function submitBreakdown() {
    setError('')
    setBusy(true)
    try {
      const data = await api<SubmitResponse>('/gap-check', {
        method: 'POST',
        body: {
          email,
          firstName,
          state,
          industry,
          orgSize,
          currentSetup,
          answers: answers.map((a) => Boolean(a)),
        },
      })
      setResult(data)
      setScreen(6)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-16">
      <div className="mx-auto w-full max-w-xl">
        {screen === 'landing' && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <h1 className="text-2xl font-semibold text-ink">
              Would your psychosocial risk records hold up if someone asked today?
            </h1>
            <p className="mt-4 text-sm text-muted">
              A free, three minute check against what WHS law actually requires. No credit card, no obligation, and no
              email needed until you want your full result.
            </p>
            <Button className="mt-6" onClick={() => setScreen(1)}>
              Start the gap check
            </Button>
            <p className="mt-3 text-xs text-muted">Takes about 3 minutes · Works for any Australian state or territory</p>
          </div>
        )}

        {screen === 1 && (
          <div className="rounded-xl border border-border bg-surface p-8">
            <h2 className="text-xl font-semibold text-ink">A little about your organisation</h2>
            <p className="mt-2 text-sm text-muted">
              This helps us show you the legislation and hazards that actually apply to you, not a generic national
              summary.
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="state">Which state or territory do you operate in?</Label>
                <Select id="state" value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Select one</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="industry">What industry best describes your organisation?</Label>
                <Select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option value="">Select one</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="orgSize">Roughly how many people work there?</Label>
                <Select id="orgSize" value={orgSize} onChange={(e) => setOrgSize(e.target.value)}>
                  <option value="">Select one</option>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Button className="mt-6 w-full" disabled={!state || !industry || !orgSize} onClick={() => setScreen(2)}>
              Continue
            </Button>
          </div>
        )}

        {screen === 2 && (
          <div className="rounded-xl border border-border bg-surface p-8">
            <h2 className="text-xl font-semibold text-ink">What do you currently have in place?</h2>
            <p className="mt-2 text-sm text-muted">
              Pick whatever applies. There's no wrong answer here, we just want to know where you're starting from.
            </p>
            <div className="mt-6 space-y-3">
              {CURRENT_SETUP_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={currentSetup.includes(option)}
                    onChange={() => toggleSetup(option)}
                    className="h-4 w-4 rounded border-border accent-accent"
                  />
                  {option}
                </label>
              ))}
            </div>
            <Button className="mt-6 w-full" onClick={() => setScreen(3)}>
              Continue
            </Button>
          </div>
        )}

        {screen === 3 && (
          <div className="rounded-xl border border-border bg-surface p-8">
            <h2 className="text-xl font-semibold text-ink">Now the real question: could you prove it?</h2>
            <p className="mt-2 text-sm text-muted">Answer honestly. This is just for you until you choose to share it.</p>
            <div className="mt-6 space-y-5">
              {STEP3_QUESTIONS.map((q, i) => (
                <div key={i}>
                  <p className="text-sm text-ink">{q}</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant={answers[i] === true ? 'primary' : 'secondary'}
                      onClick={() => setAnswer(i, true)}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={answers[i] === false ? 'primary' : 'secondary'}
                      onClick={() => setAnswer(i, false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-6 w-full" disabled={answers.some((a) => a === null)} onClick={() => setScreen(4)}>
              Show my result
            </Button>
          </div>
        )}

        {screen === 4 && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <h2 className="text-xl font-semibold text-ink">{TIER_COPY[tier].headline}</h2>
            <p className="mt-4 text-sm text-muted">{TIER_COPY[tier].body}</p>
            <Button className="mt-6" onClick={() => setScreen(5)}>
              Get my full breakdown for {industry} in {state}
            </Button>
            <p className="mt-3 text-xs text-muted">
              We'll also send the specific hazards and legislation that apply to your industry and state.
            </p>
          </div>
        )}

        {screen === 5 && (
          <div className="rounded-xl border border-border bg-surface p-8">
            <h2 className="text-xl font-semibold text-ink">Where should we send it?</h2>
            <p className="mt-2 text-sm text-muted">
              Your personalised breakdown, plus the hazards and legislation specific to {state} and {industry}. No
              spam, unsubscribe any time.
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="firstName">First name (optional)</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            <Button className="mt-6 w-full" disabled={!email || busy} onClick={submitBreakdown}>
              {busy ? 'Sending…' : 'Send my breakdown'}
            </Button>
            <p className="mt-3 text-xs text-muted">
              We'll only use this to send your result and occasional, relevant updates. See our{' '}
              <Link to="/privacy" className="text-accent hover:underline">
                Privacy policy
              </Link>
              .
            </p>
          </div>
        )}

        {screen === 6 && result && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <h2 className="text-xl font-semibold text-ink">Check your inbox, it's on its way</h2>
            <p className="mt-2 text-sm text-muted">
              In the meantime, want to see what this looks like inside an actual system instead of a PDF?
            </p>
            <Button className="mt-6" onClick={() => (window.location.href = '/signup')}>
              Start your free trial
            </Button>
            <p className="mt-2 text-xs text-muted">
              We'll pre-load your hazard register with the gaps we just found for {industry} in {state}.
            </p>
            <p className="mt-4 text-sm">
              <a href={`https://connexus-api-f5h7.onrender.com${result.pdfUrl}`} className="text-accent hover:underline">
                Not ready? No worries, your breakdown is already on its way.
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
