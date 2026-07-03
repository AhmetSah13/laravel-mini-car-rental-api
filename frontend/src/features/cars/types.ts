import type { CarStatus } from '@/shared/types/enums'

export type CarBrandSummary = {
  id: number
  name: string
}

export type Car = {
  id: number
  brand_id: number
  plate_number: string
  model: string
  year: number
  daily_price: string
  status: CarStatus
  brand?: CarBrandSummary
  created_at?: string
  updated_at?: string
}

export type CarListParams = {
  page?: number
  per_page?: number
  brand_id?: number | string
  status?: CarStatus | ''
  min_price?: number | string
  max_price?: number | string
  sort_by?: 'id' | 'daily_price' | 'year' | 'created_at' | ''
  sort_direction?: 'asc' | 'desc' | ''
}

export type CarCreatedEvent = {
  car: Car
}
