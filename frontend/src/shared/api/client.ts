import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { TOKEN_KEY } from '@/shared/constants/storage'
import { useAuthStore } from '@/features/auth/store'
import { getEcho, resetEcho } from '@/shared/realtime/echo'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

function requestPath(url?: string): string {
  return url ?? ''
}

function isAuthCredentialRequest(url?: string): boolean {
  const path = requestPath(url)
  return path.includes('/auth/login') || path.includes('/auth/register')
}

function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/cars') ||
    pathname.startsWith('/brands') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  )
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Enables broadcast(...)->toOthers() to skip the creating client.
  const socketId = getEcho()?.socketId()
  if (socketId) {
    config.headers['X-Socket-Id'] = socketId
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (!error.response) {
      toast.error('Sunucuya bağlanılamadı. API adresini ve backend servisini kontrol edin.')
      return Promise.reject(error)
    }

    const status = error.response.status
    const message = error.response.data?.message
    const requestUrl = error.config?.url

    if (status === 401) {
      // Failed login/register must not force a navigation loop.
      if (!isAuthCredentialRequest(requestUrl)) {
        useAuthStore.getState().clearAuth()
        resetEcho()

        // Keep public catalog usable when a stale token exists.
        if (!isPublicPath(window.location.pathname)) {
          const redirect = encodeURIComponent(window.location.pathname + window.location.search)
          window.location.assign(`/login?redirect=${redirect}`)
        }
      }
    }

    if (status === 403) {
      toast.error(message ?? 'Bu işlem için yetkiniz yok.')
    }

    if (status === 429) {
      toast.error(message ?? 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.')
    }

    if (status === 400) {
      toast.error(message ?? 'İşlem gerçekleştirilemedi.')
    }

    return Promise.reject(error)
  },
)
