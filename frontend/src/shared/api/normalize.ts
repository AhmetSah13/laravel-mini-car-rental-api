import type { ApiResponse, PaginationMeta } from '@/shared/types/api'

/**
 * Defensive unwrap for ApiResponse payloads.
 * Backend normally returns { success, message, data, meta? }.
 */
export function normalizeApiResponse<T>(payload: ApiResponse<T> | T): ApiResponse<T> {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload as ApiResponse<T>
  }

  return {
    success: true,
    message: 'Success',
    data: payload as T,
  }
}

export function normalizeList<T>(payload: ApiResponse<T[] | T> | T[] | T): {
  items: T[]
  meta?: PaginationMeta
  message: string
  success: boolean
} {
  const response = normalizeApiResponse<T[] | T>(payload as ApiResponse<T[] | T>)
  const raw = response.data
  const items = Array.isArray(raw) ? raw : raw != null ? [raw] : []

  return {
    items,
    meta: response.meta,
    message: response.message,
    success: response.success,
  }
}
