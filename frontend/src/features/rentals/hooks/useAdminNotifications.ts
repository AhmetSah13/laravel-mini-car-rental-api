import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/store'
import { UserRole } from '@/shared/types/enums'
import { getEcho } from '@/shared/realtime/echo'
import type { RentalCreatedEvent } from '@/features/rentals/types'

const CHANNEL = 'admin.notifications'
const EVENT = '.rental.created'

/**
 * Admin-only private channel listener for rental.created notifications.
 * No-op for non-admin users, missing token, or unavailable Reverb.
 */
export function useAdminNotifications(): void {
  const token = useAuthStore((s) => s.token)
  const isAdmin = useAuthStore((s) => s.user?.role === UserRole.ADMIN)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!token || !isAdmin) {
      return
    }

    const echo = getEcho()
    if (!echo) {
      return
    }

    const channel = echo.private(CHANNEL)

    const handler = (event: RentalCreatedEvent) => {
      if (!event?.rental?.id) {
        return
      }

      toast.success('Yeni kiralama talebi oluşturuldu.')
      void queryClient.invalidateQueries({ queryKey: ['rentals'] })
    }

    channel.listen(EVENT, handler)

    channel.error((error: unknown) => {
      console.warn('[realtime] admin.notifications subscription failed', error)
    })

    return () => {
      channel.stopListening(EVENT, handler)
      echo.leave(CHANNEL)
    }
  }, [token, isAdmin, queryClient])
}
