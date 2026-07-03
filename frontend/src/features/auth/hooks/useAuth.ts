import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/features/auth/store'
import { resetEcho } from '@/shared/realtime/echo'
import { getFieldErrors, toApiError } from '@/shared/lib/errors'
import type { LoginFormValues, RegisterFormValues } from '@/features/auth/schemas/authSchemas'
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form'

function applyFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  errors?: Record<string, string[]>,
) {
  if (!errors) return
  Object.entries(errors).forEach(([field, messages]) => {
    setError(field as Path<T>, { message: messages[0] })
  })
}

export function useHydrateAuth() {
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const setHydrated = useAuthStore((s) => s.setHydrated)

  return useQuery({
    queryKey: ['auth', 'me'],
    enabled: Boolean(token),
    queryFn: async () => {
      try {
        const response = await authApi.me()
        setUser(response.data)
        setHydrated(true)
        return response.data
      } catch {
        // Stale/invalid token: clear session but do not crash public pages.
        clearAuth()
        resetEcho()
        setHydrated(true)
        return null
      }
    },
    retry: false,
  })
}

export function useLogin(setError: UseFormSetError<LoginFormValues>, redirectTo = '/dashboard') {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: LoginFormValues) => authApi.login(values),
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.user)
      queryClient.setQueryData(['auth', 'me'], response.data.user)
      toast.success(response.message)
      navigate(redirectTo)
    },
    onError: (error) => {
      const apiError = toApiError(error)
      if (apiError.status === 422) {
        applyFieldErrors(setError, getFieldErrors(error))
        return
      }
      if (apiError.status === 401 || apiError.status === 0) {
        toast.error(apiError.message)
      }
    },
  })
}

export function useRegister(setError: UseFormSetError<RegisterFormValues>) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: RegisterFormValues) => authApi.register(values),
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.user)
      queryClient.setQueryData(['auth', 'me'], response.data.user)
      toast.success(response.message)
      navigate('/dashboard')
    },
    onError: (error) => {
      const apiError = toApiError(error)
      if (apiError.status === 422) {
        applyFieldErrors(setError, getFieldErrors(error))
        return
      }
      toast.error(apiError.message)
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: (response) => {
      clearAuth()
      resetEcho()
      queryClient.clear()
      toast.success(response.message)
      navigate('/login')
    },
    onError: () => {
      clearAuth()
      resetEcho()
      queryClient.clear()
      navigate('/login')
    },

  })
}
