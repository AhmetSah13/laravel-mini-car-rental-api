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
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
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
        title="Araçlar"
        description="Public araç listesi — filtreleme ve sayfalama desteklenir."
      />

      <CarFilters
        value={filters}
        brands={brandsQuery.data?.data ?? []}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      {carsQuery.isLoading ? <LoadingSpinner /> : null}
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
