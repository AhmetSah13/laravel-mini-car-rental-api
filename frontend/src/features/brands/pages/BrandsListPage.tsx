import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Building2 } from 'lucide-react'
import { brandsApi } from '@/features/brands/api/brandsApi'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Skeleton } from '@/shared/components/Skeleton'
import { toApiError } from '@/shared/lib/errors'

export function BrandsListPage() {
  const [page, setPage] = useState(1)

  const brandsQuery = useQuery({
    queryKey: ['brands', { page }],
    queryFn: () => brandsApi.list({ page, per_page: 12 }),
  })

  return (
    <div>
      <PageHeader title="Markalar" description="Filodaki araç markalarını ve ülke bilgilerini görüntüleyin." />

      {brandsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : null}
      {brandsQuery.isError ? <ErrorAlert message={toApiError(brandsQuery.error).message} /> : null}

      {brandsQuery.data && brandsQuery.data.data.length === 0 ? (
        <EmptyState title="Marka bulunamadı" icon={<Building2 className="h-5 w-5" />} />
      ) : null}

      {brandsQuery.data && brandsQuery.data.data.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brandsQuery.data.data.map((brand) => (
              <Link key={brand.id} to={`/brands/${brand.id}`} className="group">
                <Card className="h-full transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-primary">
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{brand.name}</h3>
                  <p className="mt-2 text-sm text-muted">{brand.country ?? 'Ülke belirtilmemiş'}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3">
                    Detay
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
          {brandsQuery.data.meta ? (
            <Pagination meta={brandsQuery.data.meta} onPageChange={setPage} />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
