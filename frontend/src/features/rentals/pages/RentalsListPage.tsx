import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { rentalsApi } from '@/features/rentals/api/rentalsApi'
import { useAuthStore } from '@/features/auth/store'
import { UserRole } from '@/shared/types/enums'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { RentalStatusBadge } from '@/shared/components/StatusBadge'
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
        description="Authenticated kullanıcılar tüm kiralama kayıtlarını görür."
        actions={
          isAdmin ? (
            <Link to="/rentals/new">
              <Button>Yeni kiralama</Button>
            </Link>
          ) : null
        }
      />

      {!isAdmin ? (
        <ErrorAlert message="Yeni kiralama oluşturmak için müşteri listesi admin yetkisi gerektirir. User rolü listeyi görüntüleyebilir." />
      ) : null}

      {listQuery.isLoading ? <LoadingSpinner /> : null}
      {listQuery.isError ? <ErrorAlert message={toApiError(listQuery.error).message} /> : null}
      {listQuery.data && listQuery.data.data.length === 0 ? (
        <EmptyState title="Kiralama kaydı yok" />
      ) : null}

      {listQuery.data && listQuery.data.data.length > 0 ? (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Araç</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {listQuery.data.data.map((rental) => (
                <tr key={rental.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{rental.id}</td>
                  <td className="px-4 py-3">
                    {rental.car?.model ?? `#${rental.car_id}`}
                    {rental.car?.plate_number ? (
                      <span className="block text-xs text-slate-500">{rental.car.plate_number}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {rental.customer?.full_name ?? `#${rental.customer_id}`}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
                  </td>
                  <td className="px-4 py-3">{formatPrice(rental.total_price)}</td>
                  <td className="px-4 py-3">
                    <RentalStatusBadge status={rental.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/rentals/${rental.id}`} className="font-medium underline">
                      Detay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
