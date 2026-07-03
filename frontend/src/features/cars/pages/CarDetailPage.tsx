import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { carsApi } from '@/features/cars/api/carsApi'
import { useAuthStore } from '@/features/auth/store'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { CarStatusBadge } from '@/shared/components/StatusBadge'
import { Button } from '@/shared/components/Button'
import { formatPrice } from '@/shared/lib/format'
import { toApiError } from '@/shared/lib/errors'
import { CarStatus } from '@/shared/types/enums'

export function CarDetailPage() {
  const { id } = useParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  const carQuery = useQuery({
    queryKey: ['cars', id],
    queryFn: () => carsApi.get(id!),
    enabled: Boolean(id),
  })

  if (carQuery.isLoading) return <LoadingSpinner />
  if (carQuery.isError) return <ErrorAlert message={toApiError(carQuery.error).message} />
  if (!carQuery.data) return null

  const car = carQuery.data.data

  return (
    <div>
      <PageHeader
        title={car.model}
        description={car.brand?.name ?? `Brand #${car.brand_id}`}
        actions={
          isAuthenticated && car.status === CarStatus.AVAILABLE ? (
            <Link to="/rentals/new">
              <Button>Kiralama oluştur</Button>
            </Link>
          ) : null
        }
      />

      <Card className="max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Durum</p>
          <CarStatusBadge status={car.status} />
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-slate-500">Plaka</dt>
            <dd className="font-medium">{car.plate_number}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Yıl</dt>
            <dd className="font-medium">{car.year}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Günlük fiyat</dt>
            <dd className="font-medium">{formatPrice(car.daily_price)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Marka ID</dt>
            <dd className="font-medium">{car.brand_id}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
