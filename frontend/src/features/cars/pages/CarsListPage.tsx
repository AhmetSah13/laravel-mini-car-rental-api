import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { carsApi } from '@/features/cars/api/carsApi'
import { brandsApi } from '@/features/brands/api/brandsApi'
import { useCarRealtime } from '@/features/cars/hooks/useCarRealtime'
import type { CarListParams } from '@/features/cars/types'
import { CarCard } from '@/features/cars/components/CarCard'
import { CarFilters } from '@/features/cars/components/CarFilters'
import { PageHeader } from '@/shared/components/PageHeader'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Skeleton } from '@/shared/components/Skeleton'
import { toApiError } from '@/shared/lib/errors'

const defaultFilters: CarListParams = {
  page: 1,
  per_page: 9,
  sort_by: 'daily_price',
  sort_direction: 'asc',
}

export function CarsListPage() {
  const [filters, setFilters] = useState<CarListParams>(defaultFilters)
  const queryClient = useQueryClient()

  const brandsQuery = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => brandsApi.list({ per_page: 100 }),
  })

  const carsQuery = useQuery({
    queryKey: ['cars', filters],
    queryFn: () => carsApi.list(filters),
  })

  useCarRealtime(() => {
    void queryClient.invalidateQueries({ queryKey: ['cars'] })
    toast.info('Yeni araç eklendi.')
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Araç Kataloğu"
        description="Müsaitlik, marka ve fiyat aralığına göre araçları filtreleyin."
      />

      <CarFilters
        value={filters}
        brands={brandsQuery.data?.data ?? []}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      {carsQuery.data ? (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>{carsQuery.data.meta.total} sonuç</span>
          <span>Sayfa {carsQuery.data.meta.current_page}</span>
        </div>
      ) : null}

      {carsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-card border border-border bg-white p-4">
              <Skeleton className="h-40" />
              <Skeleton className="mt-4 h-5 w-2/3" />
              <Skeleton className="mt-3 h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : null}
      {carsQuery.isError ? <ErrorAlert message={toApiError(carsQuery.error).message} /> : null}

      {carsQuery.data && carsQuery.data.data.length === 0 ? (
        <EmptyState title="Araç bulunamadı" description="Filtreleri değiştirip tekrar deneyin." />
      ) : null}

      {carsQuery.data && carsQuery.data.data.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {carsQuery.data.data.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
          {carsQuery.data.meta ? (
            <Pagination
              meta={carsQuery.data.meta}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
