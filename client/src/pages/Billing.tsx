import { useEffect, useState, type FormEvent } from 'react'
import { Check, Lock, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, Badge } from '../components/ui/Card'
import { Input, Label, Select } from '../components/ui/Input'
import { api, ApiError } from '../lib/api'
import type { PlanTier } from '../lib/types'
import { isTrialExpired, daysLeftInTrial } from '../lib/trial'

const TIERS: { id: PlanTier; label: string; price: string; seats: string; blurb: string; features: string[] }[] = [
  {
    id: 'starter',
    label: 'Starter',
    price: '$89/mo',
    seats: '1 seat',
    blurb: 'A single person running one assessment at a time.',
    features: ['Full hazard register & action plans', 'Boardroom-ready PDF export', 'Cryptographic case sealing'],
  },
  {
    id: 'growth',
    label: 'Growth',
    price: '$179/mo',
    seats: 'Up to 3 seats',
    blurb: 'A WHS/HR team collaborating across assessments.',
    features: ['Everything in Starter', 'Unlimited assessments', 'Priority email support'],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: '$399/mo',
    seats: 'Up to 10 seats',
    blurb: 'A larger organisation with a dedicated WHS function.',
    features: ['Everything in Growth', 'Dedicated onboarding', 'Priority support SLA'],
  },
]

const INDUSTRIES = [
  'Agriculture',
  'Construction',
  'Education',
  'Maintenance Services',
  'Finance',
  'Healthcare',
  'Hospitality',
  'Logistics / Warehousing',
  'Manufacturing',
  'Mining',
  'Retail',
  'Transport',
  'Other',
]

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']

export function Billing() {
  const { org, refresh } = useAuth()
  const [busy, setBusy] = useState(false)
  const [industry, setIndustry] = useState('')
  const [state, setState] = useState('')
  const [businessUnit, setBusinessUnit] = useState('')
  const [savingOrg, setSavingOrg] = useState(false)
  const [savedOrg, setSavedOrg] = useState(false)
  const [consultantName, setConsultantName] = useState('')
  const [consultantCredential, setConsultantCredential] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)
  const [switchingTier, setSwitchingTier] = useState<PlanTier | null>(null)
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    setIndustry(org?.industry || '')
    setState(org?.state || '')
    setBusinessUnit(org?.businessUnit || '')
    setConsultantName(org?.consultantName || '')
    setConsultantCredential(org?.consultantCredential || '')
  }, [org])

  async function saveOrgProfile(e: FormEvent) {
    e.preventDefault()
    setSavingOrg(true)
    setSavedOrg(false)
    try {
      await api('/auth/org', { method: 'PATCH', body: { industry, state, businessUnit } })
      await refresh()
      setSavedOrg(true)
    } finally {
      setSavingOrg(false)
    }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setSavedProfile(false)
    try {
      await api('/auth/org', { method: 'PATCH', body: { consultantName, consultantCredential } })
      await refresh()
      setSavedProfile(true)
    } finally {
      setSavingProfile(false)
    }
  }

  async function switchTier(tier: PlanTier) {
    if (tier === org?.planTier) return
    setSwitchingTier(tier)
    try {
      await api('/auth/org', { method: 'PATCH', body: { planTier: tier } })
      await refresh()
    } finally {
      setSwitchingTier(null)
    }
  }

  async function checkout(tier: PlanTier) {
    setBusy(true)
    setCheckoutError('')
    try {
      const data = await api<{ url: string }>('/checkout/create-session', { method: 'POST', body: { tier } })
      window.location.href = data.url
    } catch (err) {
      setCheckoutError(err instanceof ApiError ? err.message : 'Something went wrong starting checkout')
    } finally {
      setBusy(false)
    }
  }

  async function openPortal() {
    setBusy(true)
    try {
      const data = await api<{ url: string }>('/checkout/portal', { method: 'POST' })
      window.location.href = data.url
    } finally {
      setBusy(false)
    }
  }

  const isSubscribed = org?.planStatus === 'active'

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-ink">Billing &amp; Organisation</h1>
        <p className="text-sm text-muted">Manage your Connexus subscription and organisation profile</p>
      </div>

      {isTrialExpired(org) ? (
        <Card className="mb-6 border-destructive/40 bg-destructive/5">
          <div className="flex items-start gap-3">
            <Lock size={18} className="mt-0.5 shrink-0 text-destructive" />
            <div>
              <div className="text-sm font-medium text-destructive">Your free trial has ended</div>
              <p className="mt-1 text-sm text-muted">
                Assessments, the hazard register, and reports are locked until you subscribe. Pick a tier below to
                restore access immediately.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        daysLeftInTrial(org) !== null && (
          <Card className="mb-6">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-muted" />
              <p className="text-sm text-ink">
                {(daysLeftInTrial(org) as number) <= 0
                  ? 'Your free trial ends today.'
                  : `${daysLeftInTrial(org)} day${daysLeftInTrial(org) === 1 ? '' : 's'} left in your free trial.`}{' '}
                <span className="text-muted">Subscribe below any time to avoid interruption.</span>
              </p>
            </div>
          </Card>
        )
      )}

      <Card className="mb-6 max-w-lg">
        <h2 className="mb-1 font-serif text-lg text-ink">Organisation profile</h2>
        <p className="mb-4 text-sm text-muted">
          This state/territory is the default used to pre-fill new assessments. If your organisation has sites in
          more than one state, you can set each assessment's own state/territory individually on its Details tab,
          which is what actually drives that assessment's legislation citations and compliance sections.
        </p>
        <form onSubmit={saveOrgProfile} className="space-y-4">
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option value="">Select industry…</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="state">State/Territory</Label>
            <Select id="state" value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">Select state…</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="businessUnit">Business unit (optional)</Label>
            <Input
              id="businessUnit"
              placeholder="e.g. Operations, Warehouse, Sydney"
              value={businessUnit}
              onChange={(e) => setBusinessUnit(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={savingOrg}>
              {savingOrg ? 'Saving…' : 'Save organisation profile'}
            </Button>
            {savedOrg && <span className="text-sm text-success">Saved</span>}
          </div>
        </form>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-1 font-serif text-lg text-ink">Plan &amp; seats</h2>
        <p className="mb-4 text-sm text-muted">
          Choose the tier that matches your team size. This sets your seat limit on the Team page today, and isn't
          wired to a separate Stripe price per tier yet, so switching here doesn't change what's charged below until
          that's connected.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TIERS.map((t) => {
            const current = org?.planTier === t.id
            return (
              <div
                key={t.id}
                className={`flex flex-col rounded-xl border p-4 ${current ? 'border-accent bg-accent/5' : 'border-border'}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="font-serif text-base text-ink">{t.label}</div>
                  {current && <Badge tone="accent">Current</Badge>}
                </div>
                <div className="text-lg font-serif text-ink">{t.price}</div>
                <div className="mb-2 text-xs text-muted">{t.seats}</div>
                <p className="mb-3 text-xs text-muted">{t.blurb}</p>
                <ul className="mb-4 flex-1 space-y-1.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-ink">
                      <Check size={12} className="mt-0.5 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={current ? 'secondary' : 'primary'}
                  disabled={current || switchingTier !== null}
                  onClick={() => switchTier(t.id)}
                >
                  {switchingTier === t.id ? 'Switching…' : current ? 'Current plan' : `Switch to ${t.label}`}
                </Button>

                {isSubscribed && current ? (
                  <Button variant="secondary" className="mt-2" onClick={openPortal} disabled={busy}>
                    {busy ? 'Opening…' : 'Manage subscription'}
                  </Button>
                ) : (
                  <Button variant="secondary" className="mt-2" onClick={() => checkout(t.id)} disabled={busy}>
                    {busy ? 'Redirecting…' : `Subscribe for ${t.price}`}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
        {checkoutError && <p className="mt-3 text-sm text-destructive">{checkoutError}</p>}
      </Card>

      <Card className="mb-6 max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-ink">{org?.name}</div>
            <div className="text-sm text-muted">Subscription status</div>
          </div>
          <Badge tone={isSubscribed ? 'success' : 'alert'}>{org?.planStatus}</Badge>
        </div>

        {isSubscribed && (
          <Button onClick={openPortal} disabled={busy}>
            {busy ? 'Opening…' : 'Manage subscription'}
          </Button>
        )}

        <p className="mt-4 text-xs text-muted">
          {isSubscribed
            ? 'Manage payment method, invoices, or cancel via the Stripe billing portal above.'
            : 'Pick a tier above to start a subscription via Stripe Checkout.'}{' '}
          Requires STRIPE_SECRET_KEY and the STRIPE_PRICE_* vars in server/.env. See server/scripts/setup-stripe-prices.mjs.
        </p>
      </Card>

      <Card className="mt-6 max-w-lg">
        <h2 className="mb-1 font-serif text-lg text-ink">Report preparer</h2>
        <p className="mb-4 text-sm text-muted">
          Printed on the cover of every PDF report you export from an assessment, usually your WHS or HR lead.
        </p>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <Label htmlFor="consultantName">Preparer name</Label>
            <Input
              id="consultantName"
              placeholder="e.g. Jordan Reyes"
              value={consultantName}
              onChange={(e) => setConsultantName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="consultantCredential">Credential / registration</Label>
            <Input
              id="consultantCredential"
              placeholder="e.g. Registered WHS Consultant, CPMSIA"
              value={consultantCredential}
              onChange={(e) => setConsultantCredential(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save profile'}
            </Button>
            {savedProfile && <span className="text-sm text-success">Saved</span>}
          </div>
        </form>
      </Card>
    </div>
  )
}
