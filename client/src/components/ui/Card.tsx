import type { HTMLAttributes, ReactNode } from 'react'

export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-5 shadow-sm shadow-black/20 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, tone = 'default' }: { label: string; value: string | number; tone?: 'default' | 'accent' | 'destructive' | 'success' | 'alert' }) {
  const toneClass = {
    default: 'text-ink',
    accent: 'text-accent',
    destructive: 'text-destructive',
    success: 'text-success',
    alert: 'text-alert',
  }[tone]

  return (
    <Card>
      <div className="text-sm text-muted">{label}</div>
      <div className={`mt-2 text-3xl font-serif ${toneClass}`}>{value}</div>
    </Card>
  )
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'accent' | 'destructive' | 'success' | 'alert' }) {
  const toneClass = {
    default: 'bg-surface-raised text-muted border-border',
    accent: 'bg-accent/15 text-accent border-accent/30',
    destructive: 'bg-destructive/15 text-destructive border-destructive/30',
    success: 'bg-success/15 text-success border-success/30',
    alert: 'bg-alert/15 text-alert border-alert/30',
  }[tone]

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClass}`}>
      {children}
    </span>
  )
}
