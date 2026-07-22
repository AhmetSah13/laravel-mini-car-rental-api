import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-muted">
        {icon ?? <SearchX className="h-5 w-5" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}
