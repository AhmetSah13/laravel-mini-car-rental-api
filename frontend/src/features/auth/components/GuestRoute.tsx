import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/store'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'

export function GuestRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  if (token && !isHydrated) {
    return <LoadingSpinner label="Oturum kontrol ediliyor..." />
  }

  if (token && user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
