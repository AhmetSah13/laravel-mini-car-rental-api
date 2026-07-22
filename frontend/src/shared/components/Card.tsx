import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Props = {
  children: ReactNode
  className?: string
  padded?: boolean
}

export function Card({ children, className, padded = true }: Props) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface shadow-sm shadow-slate-200/60',
        padded && 'p-5',
        className,
      )}
    >
      {children}
    </div>
  )
}
