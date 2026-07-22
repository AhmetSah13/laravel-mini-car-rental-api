import type { InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...props }: Props) {
  const inputId = id ?? props.name
  const errorId = error && inputId ? `${inputId}-error` : undefined

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={cn(
          'h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/15',
          className,
        )}
        {...props}
      />
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
