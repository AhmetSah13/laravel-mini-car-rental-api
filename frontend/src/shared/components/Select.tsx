import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Option = { value: string | number; label: string }

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  hint?: string
  options: Option[]
  placeholder?: string
}

export function Select({ label, error, hint, options, placeholder, className, id, ...props }: Props) {
  const selectId = id ?? props.name
  const errorId = error && selectId ? `${selectId}-error` : undefined

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={selectId} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={cn(
          'h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/15',
          className,
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
