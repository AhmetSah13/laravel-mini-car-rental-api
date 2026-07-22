import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'default' | 'success' | 'warning' | 'destructive' | 'neutral' | 'primary'

const variants: Record<Variant, string> = {
  default: 'border-border bg-slate-100 text-slate-700',
  neutral: 'border-border bg-slate-100 text-slate-700',
  primary: 'border-blue-200 bg-blue-50 text-primary',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  destructive: 'border-red-200 bg-red-50 text-destructive',
}

export function Badge({
  children,
  className,
  variant = 'default',
}: {
  children: ReactNode
  className?: string
  variant?: Variant
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
