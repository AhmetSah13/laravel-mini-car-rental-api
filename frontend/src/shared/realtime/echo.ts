import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { TOKEN_KEY } from '@/shared/constants/storage'

let echoInstance: Echo<'reverb'> | null = null
/** Token used when the current Echo instance was created. */
let echoToken: string | null | undefined = undefined

function hasRealtimeConfig(): boolean {
  return Boolean(
    import.meta.env.VITE_REVERB_APP_KEY &&
      import.meta.env.VITE_REVERB_HOST &&
      import.meta.env.VITE_REVERB_PORT,
  )
}

function broadcastingAuthEndpoint(): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080/api'
  return `${apiBase.replace(/\/api\/?$/, '')}/broadcasting/auth`
}

function readToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Disconnect and clear the Echo singleton (e.g. on logout).
 */
export function resetEcho(): void {
  if (echoInstance) {
    try {
      echoInstance.disconnect()
    } catch {
      // ignore disconnect errors
    }
  }
  echoInstance = null
  echoToken = undefined
}

/**
 * Lazy Echo client for Laravel Reverb.
 * Recreates the instance when the auth token changes so private channels work.
 * Returns null when env is missing or initialization fails (REST keeps working).
 */
export function getEcho(): Echo<'reverb'> | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!hasRealtimeConfig()) {
    if (echoToken !== null) {
      console.warn('[realtime] Reverb env missing; WebSocket disabled.')
      echoToken = null
    }
    return null
  }

  const token = readToken()

  if (echoInstance && echoToken === token) {
    return echoInstance
  }

  if (echoInstance) {
    try {
      echoInstance.disconnect()
    } catch {
      // ignore
    }
    echoInstance = null
  }

  try {
    ;(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher

    const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http'
    const port = Number(import.meta.env.VITE_REVERB_PORT ?? 8081)

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: port,
      wssPort: port,
      forceTLS: scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: broadcastingAuthEndpoint(),
      auth: {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    })

    echoToken = token
    return echoInstance
  } catch (error) {
    console.warn('[realtime] Echo init failed; WebSocket disabled.', error)
    echoInstance = null
    echoToken = undefined
    return null
  }
}
