import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { CarFront, LayoutDashboard, LogIn, Menu, UserPlus, X } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/lib/cn'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-slate-100 text-foreground' : 'text-slate-600 hover:bg-slate-100 hover:text-foreground',
  )

export function PublicLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

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

  const navLinks = (
    <>
      <NavLink to="/" className={linkClass}>
        Ana Sayfa
      </NavLink>
      <NavLink to="/cars" className={linkClass}>
        Araçlar
      </NavLink>
      <NavLink to="/brands" className={linkClass}>
        Markalar
      </NavLink>
    </>
  )

  const authActions = isAuthenticated ? (
    <>
      <Link to="/dashboard">
        <Button variant="outline" size="sm">
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Button>
      </Link>
      <UserMenu />
    </>
  ) : (
    <>
      <Link to="/login">
        <Button variant="ghost" size="sm">
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Giriş
        </Button>
      </Link>
      <Link to="/register">
        <Button size="sm">
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Kayıt
        </Button>
      </Link>
    </>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-white">
              <CarFront className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>FleetDesk</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">{navLinks}</nav>
          <div className="hidden items-center gap-2 md:flex">{authActions}</div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menüyü aç"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
          />
          <aside className="relative ml-auto flex h-full w-[min(21rem,88vw)] flex-col bg-white p-4 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-white">
                  <CarFront className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>FleetDesk</span>
              </Link>
              <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Menüyü kapat">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1">{navLinks}</nav>
            <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">{authActions}</div>
          </aside>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <Outlet />
      </main>
    </div>
  )
}
