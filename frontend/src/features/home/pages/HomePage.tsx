import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { carsApi } from '@/features/cars/api/carsApi'
import { useAuthStore } from '@/features/auth/store'
import { CarCard } from '@/features/cars/components/CarCard'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'
import { VehicleVisual } from '@/shared/components/VehicleVisual'
import { CarStatus } from '@/shared/types/enums'

export function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  const previewQuery = useQuery({
    queryKey: ['cars', 'home-preview'],
    queryFn: () =>
      carsApi.list({
        status: CarStatus.AVAILABLE,
        per_page: 3,
        sort_by: 'daily_price',
        sort_direction: 'asc',
      }),
  })

  return (
    <div className="space-y-12">
      <section className="grid min-h-[520px] items-center gap-10 py-8 md:grid-cols-[1fr_0.9fr]">
        <div>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-normal text-foreground sm:text-6xl">
            Araç kiralama yönetimi.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Filonu gör, uygun aracı seç, kiralama sürecini tek ekrandan yönet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/cars">
              <Button size="lg">
                Araçları Gör
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link to={isAuthenticated ? '/dashboard' : '/login'}>
              <Button variant="outline" size="lg">
                {isAuthenticated ? 'Panele Git' : 'Giriş Yap'}
              </Button>
            </Link>
          </div>
        </div>
        <VehicleVisual className="min-h-80" label="Araç filosu görsel alanı" />
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Uygun araçlar</h2>
            <p className="mt-1 text-sm text-muted">Kiralama için hazır araçlar.</p>
          </div>
          <Link to="/cars">
            <Button variant="outline">
              Tümü
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        {previewQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Card key={item} className="space-y-4">
                <Skeleton className="h-36" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : null}

        {previewQuery.data && previewQuery.data.data.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {previewQuery.data.data.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
