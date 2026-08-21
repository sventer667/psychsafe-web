import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
}

const variants = {
  primary: 'bg-accent text-accent-contrast hover:brightness-110',
  secondary: 'bg-surface-raised text-ink border border-border hover:border-accent/50',
  ghost: 'bg-transparent text-muted hover:text-ink',
  destructive: 'bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
