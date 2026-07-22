import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarDays, Plus } from 'lucide-react'
import { rentalsApi } from '@/features/rentals/api/rentalsApi'
import { useAuthStore } from '@/features/auth/store'
import { UserRole } from '@/shared/types/enums'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { RentalStatusBadge } from '@/shared/components/StatusBadge'
import { SkeletonRows } from '@/shared/components/Skeleton'
import { formatPrice, formatDate } from '@/shared/lib/format'
import { toApiError } from '@/shared/lib/errors'

export function RentalsListPage() {
  const [page, setPage] = useState(1)
  const isAdmin = useAuthStore((s) => s.user?.role === UserRole.ADMIN)

  const listQuery = useQuery({
    queryKey: ['rentals', page],
    queryFn: () => rentalsApi.list({ page, per_page: 10 }),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kiralamalar"
        description="Araç, müşteri, tarih aralığı ve durum bilgileriyle kiralama kayıtları."
        actions={
          isAdmin ? (
            <Link to="/rentals/new">
              <Button>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Yeni kiralama
              </Button>
            </Link>
          ) : null
        }
      />

      {!isAdmin ? (
        <ErrorAlert message="Yeni kiralama oluşturmak admin yetkisi gerektirir. User rolü mevcut kayıtları görüntüleyebilir." />
      ) : null}

      {listQuery.isLoading ? <SkeletonRows rows={6} /> : null}
      {listQuery.isError ? <ErrorAlert message={toApiError(listQuery.error).message} /> : null}
      {listQuery.data && listQuery.data.data.length === 0 ? (
        <EmptyState
          title="Kiralama kaydı yok"
          description="Kayıt oluştuğunda burada araç, müşteri ve durum bilgileriyle listelenir."
          icon={<CalendarDays className="h-5 w-5" />}
        />
      ) : null}

      {listQuery.data && listQuery.data.data.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Araç</th>
                  <th className="px-4 py-3">Müşteri</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listQuery.data.data.map((rental) => (
                  <tr key={rental.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <span className="font-semibold text-foreground">{rental.car?.model ?? `#${rental.car_id}`}</span>
                      {rental.car?.plate_number ? (
                        <span className="block text-xs text-muted">{rental.car.plate_number}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">{rental.customer?.full_name ?? `#${rental.customer_id}`}</td>
                    <td className="px-4 py-4">{formatDate(rental.start_date)} → {formatDate(rental.end_date)}</td>
                    <td className="px-4 py-4 font-semibold">{formatPrice(rental.total_price)}</td>
                    <td className="px-4 py-4"><RentalStatusBadge status={rental.status} /></td>
                    <td className="px-4 py-4 text-right">
                      <Link to={`/rentals/${rental.id}`} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                        Detay <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-border md:hidden">
            {listQuery.data.data.map((rental) => (
              <Link key={rental.id} to={`/rentals/${rental.id}`} className="block p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{rental.car?.model ?? `#${rental.car_id}`}</p>
                    <p className="text-sm text-muted">{rental.customer?.full_name ?? `#${rental.customer_id}`}</p>
                  </div>
                  <RentalStatusBadge status={rental.status} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-muted">
                  <span>{formatDate(rental.start_date)} → {formatDate(rental.end_date)}</span>
                  <span className="font-semibold text-foreground">{formatPrice(rental.total_price)}</span>
                </div>
              </Link>
            ))}
          </div>

          {listQuery.data.meta ? (
            <div className="px-4 pb-4">
              <Pagination meta={listQuery.data.meta} onPageChange={setPage} />
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  )
}
