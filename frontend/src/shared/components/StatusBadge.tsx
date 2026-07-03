import { Badge } from '@/shared/components/Badge'
import type { CarStatus, RentalStatus } from '@/shared/types/enums'

const carColors: Record<CarStatus, string> = {
  available: 'bg-emerald-100 text-emerald-800',
  rented: 'bg-amber-100 text-amber-800',
  maintenance: 'bg-slate-200 text-slate-700',
}

const rentalColors: Record<RentalStatus, string> = {
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function CarStatusBadge({ status }: { status: CarStatus }) {
  return <Badge className={carColors[status]}>{status}</Badge>
}

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  return <Badge className={rentalColors[status]}>{status}</Badge>
}
