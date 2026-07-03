import { apiClient } from '@/shared/api/client'
import { normalizeApiResponse, normalizeList } from '@/shared/api/normalize'
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api'
import type { Customer, CustomerListParams } from '@/features/customers/types'

export type CustomerInput = {
  full_name: string
  email: string
  phone?: string | null
}

export const customersApi = {
  async list(params: CustomerListParams = {}) {
    const { data } = await apiClient.get<PaginatedResponse<Customer>>('/customers', { params })
    const list = normalizeList<Customer>(data)
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
    const { data } = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`)
    return normalizeApiResponse(data)
  },

  async create(payload: CustomerInput) {
    const { data } = await apiClient.post<ApiResponse<Customer>>('/customers', payload)
    return normalizeApiResponse(data)
  },

  async update(id: number, payload: Partial<CustomerInput>) {
    const { data } = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, payload)
    return normalizeApiResponse(data)
  },

  async remove(id: number) {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/customers/${id}`)
    return normalizeApiResponse(data)
  },
}
