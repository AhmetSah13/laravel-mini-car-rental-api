import { apiClient } from '@/shared/api/client'
import { normalizeApiResponse } from '@/shared/api/normalize'
import type { ApiResponse } from '@/shared/types/api'
import type { AuthPayload, User } from '@/features/auth/types'

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const authApi = {
  async login(payload: LoginInput) {
    const { data } = await apiClient.post<ApiResponse<AuthPayload>>('/auth/login', payload)
    return normalizeApiResponse(data)
  },

  async register(payload: RegisterInput) {
    const { data } = await apiClient.post<ApiResponse<AuthPayload>>('/auth/register', payload)
    return normalizeApiResponse(data)
  },

  async me() {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me')
    return normalizeApiResponse(data)
  },

  async logout() {
    const { data } = await apiClient.post<ApiResponse<null>>('/auth/logout')
    return normalizeApiResponse(data)
  },
}
