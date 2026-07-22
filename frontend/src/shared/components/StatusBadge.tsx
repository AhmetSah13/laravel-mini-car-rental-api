import { Badge } from '@/shared/components/Badge'
import type { CarStatus, RentalStatus } from '@/shared/types/enums'

const carLabels: Record<CarStatus, string> = {
  available: 'Available',
  rented: 'Rented',
  maintenance: 'Maintenance',
}

const rentalLabels: Record<RentalStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function CarStatusBadge({ status }: { status: CarStatus }) {
  const variant = status === 'available' ? 'success' : status === 'rented' ? 'warning' : 'neutral'
  return <Badge variant={variant}>{carLabels[status]}</Badge>
}

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  const variant =
    status === 'completed' ? 'success' : status === 'cancelled' ? 'destructive' : 'primary'
  return <Badge variant={variant}>{rentalLabels[status]}</Badge>
}
