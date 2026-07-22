import { CarFront } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export function VehicleVisual({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      className={cn(
        'relative flex min-h-36 items-center justify-center overflow-hidden rounded-md border border-border bg-gradient-to-br from-slate-50 to-white',
        className,
      )}
      aria-label={label}
    >
      <div className="absolute inset-x-8 bottom-10 h-px bg-slate-300" />
      <div className="relative flex h-24 w-40 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm">
        <CarFront className="h-12 w-12 text-foreground" aria-hidden="true" />
      </div>
    </div>
  )
}
