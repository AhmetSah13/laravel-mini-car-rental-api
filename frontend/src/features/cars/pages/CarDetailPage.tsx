import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Hash, ShieldCheck } from 'lucide-react'
import { carsApi } from '@/features/cars/api/carsApi'
import { useAuthStore } from '@/features/auth/store'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { CarStatusBadge } from '@/shared/components/StatusBadge'
import { VehicleVisual } from '@/shared/components/VehicleVisual'
import { Button } from '@/shared/components/Button'
import { formatPrice } from '@/shared/lib/format'
import { toApiError } from '@/shared/lib/errors'
import { CarStatus } from '@/shared/types/enums'

export function CarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  const carQuery = useQuery({
    queryKey: ['cars', id],
    queryFn: () => carsApi.get(id!),
    enabled: Boolean(id),
  })

  if (carQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (carQuery.isError) {
    return (
      <ErrorAlert
        message={toApiError(carQuery.error).message}
        action={<Button variant="outline" size="sm" onClick={() => navigate('/cars')}>Kataloğa dön</Button>}
      />
    )
  }
  if (!carQuery.data) return null

  const car = carQuery.data.data
  const canRent = isAuthenticated && car.status === CarStatus.AVAILABLE

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${car.brand?.name ?? 'Araç'} ${car.model}`}
        description="Araç bilgileri, fiyat ve kiralama uygunluğu"
        actions={
          <Button variant="outline" onClick={() => navigate('/cars')}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Listeye dön
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <VehicleVisual className="min-h-80" label={`${car.model} detay görseli`} />

        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted">{car.brand?.name ?? `Brand #${car.brand_id}`}</p>
              <h2 className="mt-1 text-2xl font-semibold text-foreground">{car.model}</h2>
            </div>
            <CarStatusBadge status={car.status} />
          </div>

          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-sm font-medium text-muted">Günlük fiyat</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{formatPrice(car.daily_price)}</p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border p-3">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
                <Hash className="h-4 w-4" /> Plaka
              </dt>
              <dd className="mt-1 font-semibold">{car.plate_number}</dd>
            </div>
            <div className="rounded-md border border-border p-3">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
                <Calendar className="h-4 w-4" /> Yıl
              </dt>
              <dd className="mt-1 font-semibold">{car.year}</dd>
            </div>
            <div className="rounded-md border border-border p-3 sm:col-span-2">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
                <ShieldCheck className="h-4 w-4" /> Kiralama durumu
              </dt>
              <dd className="mt-1 text-sm text-muted">
                {car.status === CarStatus.AVAILABLE
                  ? 'Bu araç kiralama için uygun görünüyor.'
                  : 'Bu araç şu anda kiralama için uygun değil.'}
              </dd>
            </div>
          </dl>

          {canRent ? (
            <Link to="/rentals/new">
              <Button className="w-full">Kiralama oluştur</Button>
            </Link>
          ) : (
            <Link to={isAuthenticated ? '/cars' : '/login'}>
              <Button variant="outline" className="w-full">
                {isAuthenticated ? 'Uygun araçları görüntüle' : 'Kiralama için giriş yap'}
              </Button>
            </Link>
          )}
        </Card>
      </div>
    </div>
  )
}
