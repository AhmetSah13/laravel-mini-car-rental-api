import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/store'
import { UserRole } from '@/shared/types/enums'

export function AdminRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)

  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
