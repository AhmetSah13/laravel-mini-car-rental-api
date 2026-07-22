export function LoadingSpinner({ label = 'Yükleniyor...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-muted">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
