import { apiClient } from '@/shared/api/client'
import { normalizeApiResponse, normalizeList } from '@/shared/api/normalize'
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api'
import type { Rental, RentalListParams } from '@/features/rentals/types'
import type { RentalStatus } from '@/shared/types/enums'

export type RentalInput = {
  car_id: number
  customer_id: number
  start_date: string
  end_date: string
  status?: RentalStatus
}

export const rentalsApi = {
  async list(params: RentalListParams = {}) {
    const { data } = await apiClient.get<PaginatedResponse<Rental>>('/rentals', { params })
    const list = normalizeList<Rental>(data)
    return {
      success: list.success,
      message: list.message,
      data: list.items,
      meta: list.meta ?? {
        current_page: 1,
        per_page: list.items.length,
        total: list.items.length,
        last_page: 1,
      },
    }
  },

  async get(id: number | string) {
    const { data } = await apiClient.get<ApiResponse<Rental>>(`/rentals/${id}`)
    return normalizeApiResponse(data)
  },

  async create(payload: RentalInput) {
    const { data } = await apiClient.post<ApiResponse<Rental>>('/rentals', payload)
    return normalizeApiResponse(data)
  },

  async update(id: number, payload: Partial<RentalInput> & { status?: RentalStatus }) {
    const { data } = await apiClient.put<ApiResponse<Rental>>(`/rentals/${id}`, payload)
    return normalizeApiResponse(data)
  },

  async remove(id: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/rentals/${id}`)
    return normalizeApiResponse(data)
  },
}
