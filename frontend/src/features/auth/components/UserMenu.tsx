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
    <div className="flex items-center gap-3">
      <Link
        to="/profile"
        className="hidden items-center gap-2 text-sm text-slate-700 hover:text-slate-900 sm:flex"
      >
        <User className="h-4 w-4" />
        <span>
          {user.name} <span className="text-slate-400">({user.role})</span>
        </span>
      </Link>
      <Button variant="secondary" size="sm" onClick={() => logout.mutate()} loading={logout.isPending}>
        <LogOut className="h-4 w-4" />
        Çıkış
      </Button>
    </div>
  )
}
