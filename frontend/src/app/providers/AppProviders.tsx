import { useEffect, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/features/auth/store'
import { useHydrateAuth } from '@/features/auth/hooks/useAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function AuthBootstrap({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const setHydrated = useAuthStore((s) => s.setHydrated)
  const hydrate = useHydrateAuth()

  useEffect(() => {
    if (!token) {
      setHydrated(true)
    }
  }, [token, setHydrated])

  useEffect(() => {
    if (hydrate.isFetched || hydrate.isError || !token) {
      setHydrated(true)
    }
  }, [hydrate.isFetched, hydrate.isError, token, setHydrated])

  return children
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        {children}
        <Toaster richColors position="top-right" />
      </AuthBootstrap>
    </QueryClientProvider>
  )
}
