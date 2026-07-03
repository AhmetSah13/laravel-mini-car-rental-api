import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { cn } from '@/shared/lib/cn'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn('text-sm font-medium', isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900')

export function PublicLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Mini Car Rental
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            <NavLink to="/cars" className={linkClass}>
              Araçlar
            </NavLink>
            <NavLink to="/brands" className={linkClass}>
              Markalar
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
                <UserMenu />
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Giriş
                </NavLink>
                <NavLink to="/register" className={linkClass}>
                  Kayıt
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
