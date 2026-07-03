import { apiClient } from '@/shared/api/client'
import { normalizeApiResponse, normalizeList } from '@/shared/api/normalize'
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api'
import type { Car, CarListParams } from '@/features/cars/types'
import type { CarStatus } from '@/shared/types/enums'

export type CarInput = {
  brand_id: number
  plate_number: string
  model: string
  year: number
  daily_price: number
  status: CarStatus
}

export const carsApi = {
  async list(params: CarListParams = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null),
    )
    const { data } = await apiClient.get<PaginatedResponse<Car>>('/cars', { params: cleanParams })
    const list = normalizeList<Car>(data)
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
    const { data } = await apiClient.get<ApiResponse<Car>>(`/cars/${id}`)
    return normalizeApiResponse(data)
  },

  async create(payload: CarInput) {
    const { data } = await apiClient.post<ApiResponse<Car>>('/cars', payload)
    return normalizeApiResponse(data)
  },

  async update(id: number, payload: Partial<CarInput>) {
    const { data } = await apiClient.put<ApiResponse<Car>>(`/cars/${id}`, payload)
    return normalizeApiResponse(data)
  },

  async remove(id: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/cars/${id}`)
    return normalizeApiResponse(data)
  },
}
