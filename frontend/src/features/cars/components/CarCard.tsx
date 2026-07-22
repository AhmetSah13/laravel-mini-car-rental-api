import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Gauge, Hash } from 'lucide-react'
import type { Car } from '@/features/cars/types'
import { Card } from '@/shared/components/Card'
import { CarStatusBadge } from '@/shared/components/StatusBadge'
import { VehicleVisual } from '@/shared/components/VehicleVisual'
import { formatPrice } from '@/shared/lib/format'

export function CarCard({ car }: { car: Car }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <VehicleVisual className="min-h-40 rounded-b-none border-x-0 border-t-0" label={`${car.model} araç görseli`} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted">{car.brand?.name ?? `Brand #${car.brand_id}`}</p>
            <h3 className="mt-1 truncate text-lg font-semibold text-foreground">{car.model}</h3>
          </div>
          <CarStatusBadge status={car.status} />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted">
            <Hash className="h-4 w-4" aria-hidden="true" />
            <span className="truncate">{car.plate_number}</span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>{car.year}</span>
          </div>
          <div className="col-span-2 flex items-end justify-between rounded-md bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-muted">
              <Gauge className="h-4 w-4" aria-hidden="true" />
              <span>Günlük</span>
            </div>
            <dd className="text-lg font-semibold text-foreground">{formatPrice(car.daily_price)}</dd>
          </div>
        </dl>
        <Link
          to={`/cars/${car.id}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3"
        >
          Detayı gör
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  )
}
