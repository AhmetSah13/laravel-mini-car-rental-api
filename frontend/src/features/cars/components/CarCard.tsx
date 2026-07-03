import { Link } from 'react-router-dom'
import type { Car } from '@/features/cars/types'
import { Card } from '@/shared/components/Card'
import { CarStatusBadge } from '@/shared/components/StatusBadge'
import { formatPrice } from '@/shared/lib/format'

export function CarCard({ car }: { car: Car }) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{car.model}</h3>
          <p className="text-sm text-slate-500">{car.brand?.name ?? `Brand #${car.brand_id}`}</p>
        </div>
        <CarStatusBadge status={car.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Plaka</dt>
          <dd className="font-medium">{car.plate_number}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Yıl</dt>
          <dd className="font-medium">{car.year}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-slate-500">Günlük fiyat</dt>
          <dd className="text-base font-semibold text-slate-900">{formatPrice(car.daily_price)}</dd>
        </div>
      </dl>
      <Link
        to={`/cars/${car.id}`}
        className="mt-auto pt-4 text-sm font-medium text-slate-900 underline"
      >
        Detayı gör
      </Link>
    </Card>
  )
}
