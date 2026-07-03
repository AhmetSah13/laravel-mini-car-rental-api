import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/features/auth/store'
import { getEcho } from '@/shared/realtime/echo'
import type { CarCreatedEvent } from '@/features/cars/types'

const CHANNEL = 'cars'
const EVENT = '.car.created'

/**
 * Subscribe to public `cars` channel for `car.created` events.
 * Safe no-op when Reverb/Echo is unavailable.
 * Re-subscribes when auth token changes (Echo instance may be recreated).
 */
export function useCarRealtime(onCarCreated: (event: CarCreatedEvent) => void): void {
  const callbackRef = useRef(onCarCreated)
  callbackRef.current = onCarCreated
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    const echo = getEcho()
    if (!echo) {
      return
    }

    const channel = echo.channel(CHANNEL)
    const handler = (event: CarCreatedEvent) => {
      if (!event?.car?.id) {
        return
      }
      callbackRef.current(event)
    }

    channel.listen(EVENT, handler)

    return () => {
      channel.stopListening(EVENT, handler)
      echo.leave(CHANNEL)
    }
  }, [token])
}

