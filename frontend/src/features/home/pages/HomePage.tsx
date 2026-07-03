import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { useAuthStore } from '@/features/auth/store'

export function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-slate-900 px-6 py-12 text-white sm:px-10">
        <p className="text-sm uppercase tracking-wide text-slate-300">Mini Car Rental API</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
          Laravel Sanctum destekli araç kiralama paneli
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Public araç kataloğu, admin CRUD, kiralama iş kuralları ve Bearer token auth ile tam
          uyumlu React frontend.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/cars">
            <Button className="bg-white text-slate-900 hover:bg-slate-100">Araçları gör</Button>
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="secondary">Giriş yap</Button>
            </Link>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Public katalog</h2>
          <p className="mt-2 text-sm text-slate-500">
            Marka ve araç listeleri auth olmadan görüntülenir.
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold">Admin yönetimi</h2>
          <p className="mt-2 text-sm text-slate-500">
            Brands, cars ve customers yazma işlemleri admin rolüne açıktır.
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold">Kiralamalar</h2>
          <p className="mt-2 text-sm text-slate-500">
            Authenticated kullanıcılar rental listesini görür; create admin-first.
          </p>
        </Card>
      </div>
    </div>
  )
}
