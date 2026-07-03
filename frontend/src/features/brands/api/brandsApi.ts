import { apiClient } from '@/shared/api/client'
import { normalizeApiResponse, normalizeList } from '@/shared/api/normalize'
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api'
import type { Brand, BrandListParams } from '@/features/brands/types'

export type BrandInput = {
  name: string
  country?: string | null
}

export const brandsApi = {
  async list(params: BrandListParams = {}) {
    const { data } = await apiClient.get<PaginatedResponse<Brand>>('/brands', { params })
    const list = normalizeList<Brand>(data)
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
    const { data } = await apiClient.get<ApiResponse<Brand>>(`/brands/${id}`)
    return normalizeApiResponse(data)
  },

  async create(payload: BrandInput) {
    const { data } = await apiClient.post<ApiResponse<Brand>>('/brands', payload)
    return normalizeApiResponse(data)
  },

  async update(id: number, payload: BrandInput) {
    const { data } = await apiClient.put<ApiResponse<Brand>>(`/brands/${id}`, payload)
    return normalizeApiResponse(data)
  },

  async remove(id: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/brands/${id}`)
    return normalizeApiResponse(data)
  },
}
