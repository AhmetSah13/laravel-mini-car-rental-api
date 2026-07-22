import { Button } from '@/shared/components/Button'
import type { PaginationMeta } from '@/shared/types/api'

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}) {
  if (meta.last_page <= 1) return null

  const pages = Array.from({ length: meta.last_page }, (_, index) => index + 1).filter(
    (page) =>
      page === 1 || page === meta.last_page || Math.abs(page - meta.current_page) <= 1,
  )

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center sm:text-left">
        Sayfa {meta.current_page} / {meta.last_page} · Toplam {meta.total}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          Önceki
        </Button>
        <div className="hidden gap-1 sm:flex">
          {pages.map((page, index) => {
            const previous = pages[index - 1]
            return (
              <span key={page} className="flex gap-1">
                {previous && page - previous > 1 ? (
                  <span className="px-2 py-1 text-muted">...</span>
                ) : null}
                <Button
                  variant={page === meta.current_page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  aria-current={page === meta.current_page ? 'page' : undefined}
                >
                  {page}
                </Button>
              </span>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          Sonraki
        </Button>
      </div>
    </div>
  )
}
