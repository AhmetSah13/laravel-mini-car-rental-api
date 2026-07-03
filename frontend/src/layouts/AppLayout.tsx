import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store'
import { UserRole } from '@/shared/types/enums'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { useAdminNotifications } from '@/features/rentals/hooks/useAdminNotifications'
import { cn } from '@/shared/lib/cn'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'block rounded-lg px-3 py-2 text-sm font-medium',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
  )

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const isAdmin = useAuthStore((s) => s.user?.role === UserRole.ADMIN)

  useAdminNotifications()

  const nav = (
    <nav className="space-y-1">
      <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
        Dashboard
      </NavLink>
      <NavLink to="/cars" className={linkClass} onClick={() => setOpen(false)}>
        Araçlar
      </NavLink>
      <NavLink to="/brands" className={linkClass} onClick={() => setOpen(false)}>
        Markalar
      </NavLink>
      <NavLink to="/rentals" className={linkClass} onClick={() => setOpen(false)}>
        Kiralamalar
      </NavLink>
      <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>
        Profil
      </NavLink>
      {isAdmin ? (
        <>
          <p className="px-3 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Admin
          </p>
          <NavLink to="/admin/brands" className={linkClass} onClick={() => setOpen(false)}>
            Admin Brands
          </NavLink>
          <NavLink to="/admin/cars" className={linkClass} onClick={() => setOpen(false)}>
            Admin Cars
          </NavLink>
          <NavLink to="/admin/customers" className={linkClass} onClick={() => setOpen(false)}>
            Admin Customers
          </NavLink>
        </>
      ) : null}
    </nav>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-slate-200 bg-white p-4 lg:block">
        <Link to="/" className="mb-6 block text-lg font-semibold text-slate-900">
          Mini Car Rental
        </Link>
        {nav}
      </aside>

      <div>
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <button
            type="button"
            className="rounded-lg border border-slate-300 p-2 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menü"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>

        {open ? (
          <div className="border-b border-slate-200 bg-white p-4 lg:hidden">{nav}</div>
        ) : null}

        <main className="px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
