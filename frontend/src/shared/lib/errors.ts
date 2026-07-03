import type { AxiosError } from 'axios'
import type { ApiError, LaravelValidationErrors } from '@/shared/types/api'

type LaravelErrorBody = {
  success?: boolean
  message?: string
  errors?: LaravelValidationErrors
}

export function toApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError<LaravelErrorBody>

  if (!axiosError.response) {
    return {
      status: 0,
      message: 'Sunucuya bağlanılamadı. API adresini ve backend servisini kontrol edin.',
    }
  }

  const status = axiosError.response.status
  const data = axiosError.response.data

  return {
    status,
    message: data?.message ?? axiosError.message ?? 'Beklenmeyen bir hata oluştu.',
    errors: data?.errors,
  }
}

export function getFieldErrors(error: unknown): LaravelValidationErrors | undefined {
  return toApiError(error).errors
}
