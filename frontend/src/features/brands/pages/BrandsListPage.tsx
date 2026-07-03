import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { brandsApi } from '@/features/brands/api/brandsApi'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { toApiError } from '@/shared/lib/errors'

export function BrandsListPage() {
  const [page, setPage] = useState(1)

  const brandsQuery = useQuery({
    queryKey: ['brands', { page }],
    queryFn: () => brandsApi.list({ page, per_page: 12 }),
  })

  return (
    <div>
      <PageHeader title="Markalar" description="Public marka listesi" />

      {brandsQuery.isLoading ? <LoadingSpinner /> : null}
      {brandsQuery.isError ? <ErrorAlert message={toApiError(brandsQuery.error).message} /> : null}

      {brandsQuery.data && brandsQuery.data.data.length === 0 ? (
        <EmptyState title="Marka bulunamadı" />
      ) : null}

      {brandsQuery.data && brandsQuery.data.data.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brandsQuery.data.data.map((brand) => (
              <Card key={brand.id}>
                <h3 className="text-lg font-semibold">{brand.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{brand.country ?? 'Ülke belirtilmemiş'}</p>
                <Link
                  to={`/brands/${brand.id}`}
                  className="mt-4 inline-block text-sm font-medium underline"
                >
                  Detay
                </Link>
              </Card>
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
