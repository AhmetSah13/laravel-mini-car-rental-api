import { create } from 'zustand'
import { TOKEN_KEY, USER_KEY } from '@/shared/constants/storage'
import type { User } from '@/features/auth/types'
import { UserRole } from '@/shared/types/enums'

type AuthState = {
  token: string | null
  user: User | null
  isHydrated: boolean
  setAuth: (token: string, user: User) => void
  setUser: (user: User) => void
  clearAuth: () => void
  setHydrated: (value: boolean) => void
  isAdmin: () => boolean
  isAuthenticated: () => boolean
}

function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function readUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: readToken(),
  user: readUser(),
  isHydrated: false,

  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user })
  },

  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user })
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null })
  },

  setHydrated: (value) => set({ isHydrated: value }),

  isAdmin: () => get().user?.role === UserRole.ADMIN,

  isAuthenticated: () => Boolean(get().token && get().user),
}))
