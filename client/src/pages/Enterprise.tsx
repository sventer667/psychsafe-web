import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Lock } from 'lucide-react'
import { Card, Badge } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { api, ApiError, API_BASE, getToken } from '../lib/api'
import { hasPreviewAccess, PREVIEW_SECRET } from '../lib/previewAccess'
import { useAuth } from '../context/AuthContext'

type Row = { id: number; userName: string; action: string; detail: string; ip: string; createdAt: string }

const LABELS: Record<string, string> = {
  sign_in: 'Signed in',
  assessment_sealed: 'Sealed an assessment',
  assessment_reopened: 'Reopened an assessment',
  assessment_deleted: 'Deleted an assessment',
  report_exported: 'Exported a PDF report',
  invite_sent: 'Invited a teammate',
  role_changed: 'Changed a role',
  require_2fa_changed: 'Changed the 2FA requirement',
  audit_exported: 'Exported the audit log',
}

export function Enterprise() {
  const { org, user, refresh } = useAuth()
  const enterprise = org?.planTier === 'enterprise'
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!enterprise || user?.role !== 'admin') {
      setLoading(false)
      return
    }
    api<{ rows: Row[] }>('/enterprise/audit?limit=100')
      .then((d) => setRows(d.rows))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Could not load the audit log'))
      .finally(() => setLoading(false))
  }, [enterprise, user?.role])

  async function toggle2fa() {
    setBusy(true)
    setError('')
    try {
      await api('/enterprise/settings', { method: 'PATCH', body: { require2fa: !org?.require2fa } })
      await refresh()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not change the setting')
    } finally {
      setBusy(false)
    }
  }

  async function downloadCsv() {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/enterprise/audit.csv`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ...(hasPreviewAccess() ? { 'X-Preview-Access': PREVIEW_SECRET } : {}),
        },
      })
      if (!res.ok) throw new Error()
      const url = URL.createObjectURL(await res.blob())
      const a = document.createElement('a')
      a.href = url
      a.download = 'humanora-audit-log.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Could not download the audit log')
    } finally {
      setBusy(false)
    }
  }

  if (user?.role !== 'admin') {
    return <p className="text-sm text-muted">Only admins can see this page.</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-ink">Enterprise controls</h1>
        <p className="text-sm text-muted">Security, access and audit tools for larger organisations.</p>
      </div>

      {!enterprise && (
        <Card className="mb-6">
          <div className="flex items-start gap-3">
            <Lock size={18} className="mt-0.5 shrink-0 text-muted" />
            <div className="text-sm text-ink">
              These controls are part of the Enterprise plan: an organisation-wide audit log with CSV export, mandatory
              two-factor authentication for every user, and a read-only viewer role for auditors and executives.{' '}
              <Link to="/billing" className="text-accent hover:underline">See plans</Link>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg text-ink">Require two-factor authentication for everyone</h2>
            <p className="text-sm text-muted">
              Admins always need 2FA. When this is on, every member and viewer must also set it up before they can use
              Humanora.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Badge tone={org?.require2fa ? 'success' : 'default'}>{org?.require2fa ? 'On' : 'Off'}</Badge>
            <Button variant="secondary" onClick={toggle2fa} disabled={!enterprise || busy}>
              {org?.require2fa ? 'Turn off' : 'Turn on'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg text-ink">Audit log</h2>
            <p className="text-sm text-muted">Sign-ins, seals, reopens, exports, invitations and role changes.</p>
          </div>
          <Button variant="secondary" onClick={downloadCsv} disabled={!enterprise || busy}>
            <Download size={16} /> Export CSV
          </Button>
        </div>
        {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
        {enterprise && !loading && rows.length === 0 && !error && <p className="text-sm text-muted">Nothing recorded yet.</p>}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">Action</th>
                  <th className="py-2 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap py-2 pr-4 text-muted">{new Date(r.createdAt.replace(' ', 'T') + 'Z').toLocaleString()}</td>
                    <td className="py-2 pr-4 text-ink">{r.userName || '-'}</td>
                    <td className="py-2 pr-4 text-ink">{LABELS[r.action] || r.action}</td>
                    <td className="py-2 text-muted">{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
