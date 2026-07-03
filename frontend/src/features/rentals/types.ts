import type { RentalStatus } from '@/shared/types/enums'

export type RentalCarSummary = {
  id: number
  plate_number: string
  model: string
  daily_price: string
}

export type RentalCustomerSummary = {
  id: number
  full_name: string
  email: string
}

export type Rental = {
  id: number
  car_id: number
  customer_id: number
  start_date: string
  end_date: string
  total_price: string
  status: RentalStatus
  car?: RentalCarSummary
  customer?: RentalCustomerSummary
  created_at?: string
  updated_at?: string
}

export type RentalListParams = {
  page?: number
  per_page?: number
}

export type RentalCreatedEvent = {
  rental: Rental
}

