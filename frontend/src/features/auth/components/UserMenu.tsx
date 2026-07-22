import { Link } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { Button } from '@/shared/components/Button'

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  if (!user) return null

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Link
        to="/profile"
        className="hidden min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-foreground sm:flex"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary">
          <User className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{user.name}</span>
          <span className="block text-xs text-muted">{user.role}</span>
        </span>
      </Link>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => logout.mutate()}
        loading={logout.isPending}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Çıkış</span>
      </Button>
    </div>
  )
}
