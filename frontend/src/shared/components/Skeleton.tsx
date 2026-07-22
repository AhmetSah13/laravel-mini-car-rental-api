import { cn } from '@/shared/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200', className)} />
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_120px]">
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
          </div>
        ))}
      </div>
    </div>
  )
}
