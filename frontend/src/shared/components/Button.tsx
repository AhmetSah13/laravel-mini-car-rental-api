import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'destructive' | 'ghost'
type Size = 'sm' | 'md' | 'lg' | 'icon'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'border border-primary bg-primary text-white shadow-sm hover:bg-primary-hover',
  secondary: 'border border-border bg-surface-muted text-foreground hover:bg-slate-200/70',
  outline: 'border border-border bg-surface text-foreground hover:bg-surface-muted',
  danger: 'border border-destructive bg-destructive text-white shadow-sm hover:bg-red-800',
  destructive: 'border border-destructive bg-destructive text-white shadow-sm hover:bg-red-800',
  ghost: 'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  icon: 'h-10 w-10 p-0',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
