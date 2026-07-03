export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const CarStatus = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
} as const

export type CarStatus = (typeof CarStatus)[keyof typeof CarStatus]

export const RentalStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type RentalStatus = (typeof RentalStatus)[keyof typeof RentalStatus]

export const CAR_STATUS_OPTIONS: { value: CarStatus; label: string }[] = [
  { value: CarStatus.AVAILABLE, label: 'Available' },
  { value: CarStatus.RENTED, label: 'Rented' },
  { value: CarStatus.MAINTENANCE, label: 'Maintenance' },
]

export const RENTAL_STATUS_OPTIONS: { value: RentalStatus; label: string }[] = [
  { value: RentalStatus.ACTIVE, label: 'Active' },
  { value: RentalStatus.COMPLETED, label: 'Completed' },
  { value: RentalStatus.CANCELLED, label: 'Cancelled' },
]
