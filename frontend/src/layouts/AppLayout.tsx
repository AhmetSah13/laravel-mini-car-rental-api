import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  CalendarDays,
  CarFront,
  LayoutDashboard,
  Menu,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store'
import { UserRole } from '@/shared/types/enums'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { useAdminNotifications } from '@/features/rentals/hooks/useAdminNotifications'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/lib/cn'

const baseLink =
  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    baseLink,
    isActive
      ? 'bg-primary text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-foreground',
  )

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === UserRole.ADMIN

  useAdminNotifications()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const nav = (
    <nav className="space-y-1">
      <NavLink to="/dashboard" className={linkClass}>
        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
        Dashboard
      </NavLink>
      <NavLink to="/rentals" className={linkClass}>
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Kiralamalar
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        <UserRound className="h-4 w-4" aria-hidden="true" />
        Profil
      </NavLink>
      {isAdmin ? (
        <>
          <div className="px-3 pb-1 pt-5 text-xs font-bold uppercase tracking-wide text-slate-400">
            Admin
          </div>
          <NavLink to="/admin/customers" className={linkClass}>
            <Users className="h-4 w-4" aria-hidden="true" />
            Müşteriler
          </NavLink>
        </>
      ) : null}
    </nav>
  )

  const sidebar = (
    <aside className="flex h-full flex-col border-r border-border bg-white p-4">
      <Link to="/" className="mb-6 flex items-center gap-2 px-1 font-semibold text-foreground">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-white">
          <CarFront className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>FleetDesk</span>
      </Link>
      <div className="min-h-0 flex-1 overflow-y-auto">{nav}</div>
      {user ? (
        <div className="mt-4 rounded-md border border-border bg-slate-50 p-3">
          <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
          <Badge variant={isAdmin ? 'primary' : 'neutral'} className="mt-2">
            {user.role}
          </Badge>
        </div>
      ) : null}
    </aside>
  )

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <div className="hidden lg:block">{sidebar}</div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-[min(20rem,86vw)] shadow-xl">{sidebar}</div>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Menüyü aç"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <p className="text-sm font-semibold text-foreground">Yönetim Paneli</p>
          </div>
          <UserMenu />
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
