import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Lock, Upload } from 'lucide-react'
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
  import_assessments: 'Imported assessments',
  import_team: 'Imported team invites',
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

      <ImportCard kind="assessments" enterprise={enterprise} />
      <ImportCard kind="team" enterprise={enterprise} />

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

// Minimal CSV parser: handles quoted fields, escaped quotes and CRLF.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const t = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (quoted) {
      if (c === '"' && t[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      row.push(cell)
      cell = ''
      if (row.some((x) => x.trim() !== '')) rows.push(row)
      row = []
    } else cell += c
  }
  row.push(cell)
  if (row.some((x) => x.trim() !== '')) rows.push(row)
  return rows
}

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

const IMPORTS = {
  assessments: {
    title: 'Import assessments',
    blurb: 'Create one assessment per site or team from a spreadsheet. Columns: name, state, scope. State is optional (NSW, VIC, QLD, WA, SA, TAS, ACT, NT).',
    template: 'name,state,scope\nSydney head office,NSW,All office staff\nMelbourne warehouse,VIC,Warehouse and dispatch teams\n',
    path: '/enterprise/import/assessments',
    file: 'humanora-assessments-template.csv',
  },
  team: {
    title: 'Import team members',
    blurb: 'Create invites for many people at once. Columns: name, email. Each person gets an invite link to set their password; you can download all the links afterwards.',
    template: 'name,email\nJane Citizen,jane@example.com\nAlex Smith,alex@example.com\n',
    path: '/enterprise/import/team',
    file: 'humanora-team-template.csv',
  },
} as const

type ImportResult = {
  valid: number
  errors: { row: number; message: string }[]
  created: number
  invites?: { name: string; email: string; token: string }[]
}

function ImportCard({ kind, enterprise }: { kind: 'assessments' | 'team'; enterprise: boolean }) {
  const cfg = IMPORTS[kind]
  const [rows, setRows] = useState<Record<string, string>[] | null>(null)
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onFile(f: File | undefined) {
    setResult(null)
    setError('')
    setRows(null)
    if (!f) return
    setFileName(f.name)
    const grid = parseCsv(await f.text())
    if (grid.length < 2) {
      setError('The file needs a header row and at least one data row.')
      return
    }
    const header = grid[0].map((h) => h.trim().toLowerCase())
    const parsed = grid.slice(1).map((cells) => Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? '').trim()])))
    setRows(parsed)
    await run(parsed, false)
  }

  async function run(data: Record<string, string>[], commit: boolean) {
    setBusy(true)
    setError('')
    try {
      const r = await api<ImportResult>(cfg.path, { method: 'POST', body: { rows: data, commit } })
      setResult(r)
      if (commit && r.created > 0) setRows(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  const ready = rows && result && result.errors.length === 0 && result.created === 0
  return (
    <Card className="mb-6">
      <h2 className="font-serif text-lg text-ink">{cfg.title}</h2>
      <p className="mb-3 text-sm text-muted">{cfg.blurb}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={() => download(cfg.file, cfg.template)}>
          <Download size={16} /> Download template
        </Button>
        <label className={`inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm ${enterprise ? 'cursor-pointer text-ink hover:border-accent/50' : 'cursor-not-allowed text-muted'}`}>
          <Upload size={16} /> Choose CSV file
          <input type="file" accept=".csv,text/csv" className="hidden" disabled={!enterprise || busy} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {fileName && rows && <span className="text-sm text-muted">{fileName}</span>}
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {result && result.errors.length > 0 && (
        <div className="mt-3 rounded-lg border border-border bg-canvas p-3 text-sm">
          <p className="mb-1 text-ink">Nothing was imported. Fix these and choose the file again:</p>
          <ul className="list-disc pl-5 text-destructive">
            {result.errors.slice(0, 25).map((e, i) => (
              <li key={i}>{e.row ? `Row ${e.row}: ` : ''}{e.message}</li>
            ))}
          </ul>
          {result.errors.length > 25 && <p className="mt-1 text-muted">and {result.errors.length - 25} more</p>}
        </div>
      )}
      {ready && (
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-ink">{result.valid} rows look good.</span>
          <Button onClick={() => run(rows!, true)} disabled={busy}>{busy ? 'Importing…' : `Import ${result.valid}`}</Button>
        </div>
      )}
      {result && result.created > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-sm text-success">Imported {result.created}.</span>
          {result.invites && (
            <Button
              variant="secondary"
              onClick={() =>
                download(
                  'humanora-invite-links.csv',
                  'name,email,invite link\n' +
                    result.invites!.map((i) => `"${i.name.replace(/"/g, '""')}",${i.email},${window.location.origin}/invite/${i.token}`).join('\n') +
                    '\n'
                )
              }
            >
              <Download size={16} /> Download invite links
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
