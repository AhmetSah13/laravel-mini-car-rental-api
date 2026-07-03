import type { UserRole } from '@/shared/types/enums'

export type User = {
  id: number
  name: string
  email: string
  role: UserRole
  created_at?: string
  updated_at?: string
}

export type AuthPayload = {
  user: User
  token: string
}
