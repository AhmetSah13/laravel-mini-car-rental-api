import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

export function ErrorAlert({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{message}</p>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  )
}
