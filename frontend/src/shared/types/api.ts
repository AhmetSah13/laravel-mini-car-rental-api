export type PaginationMeta = {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
}

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: PaginationMeta
}

export type LaravelValidationErrors = Record<string, string[]>

export type ApiError = {
  status: number
  message: string
  errors?: LaravelValidationErrors
}
