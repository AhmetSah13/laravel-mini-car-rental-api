import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, CalendarDays, Car, UserRound } from 'lucide-react'
import { rentalsApi } from '@/features/rentals/api/rentalsApi'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { Skeleton } from '@/shared/components/Skeleton'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { RentalStatusBadge } from '@/shared/components/StatusBadge'
import { formatPrice, formatDate } from '@/shared/lib/format'
import { toApiError } from '@/shared/lib/errors'
import { RentalStatus } from '@/shared/types/enums'

export function RentalDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const rentalQuery = useQuery({
    queryKey: ['rentals', id],
    queryFn: () => rentalsApi.get(id!),
    enabled: Boolean(id),
  })

  const statusMutation = useMutation({
    mutationFn: (status: typeof RentalStatus.COMPLETED | typeof RentalStatus.CANCELLED) =>
      rentalsApi.update(Number(id), { status }),
    onSuccess: (response) => {
      toast.success(response.message)
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
    },
  })

  if (rentalQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72" />
      </div>
    )
  }
  if (rentalQuery.isError) return <ErrorAlert message={toApiError(rentalQuery.error).message} />
  if (!rentalQuery.data) return null

  const rental = rentalQuery.data.data
  const isActive = rental.status === RentalStatus.ACTIVE

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Kiralama #${rental.id}`}
        description="Kiralama özeti, ilgili araç ve müşteri bilgileri"
        actions={
          <>
            <RentalStatusBadge status={rental.status} />
            <Link to="/rentals">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Liste
              </Button>
            </Link>
          </>
        }
      />

      <Card className="bg-slate-900 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-300">Toplam tutar</p>
            <p className="mt-1 text-4xl font-semibold">{formatPrice(rental.total_price)}</p>
          </div>
          <p className="text-sm text-slate-300">
            {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
          </p>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-primary">
            <Car className="h-5 w-5" />
          </div>
          <h2 className="font-semibold text-foreground">Araç</h2>
          <p className="mt-2 text-sm text-muted">{rental.car?.model ?? `#${rental.car_id}`}</p>
          {rental.car?.plate_number ? <p className="mt-1 text-sm font-semibold">{rental.car.plate_number}</p> : null}
        </Card>
        <Card>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <h2 className="font-semibold text-foreground">Müşteri</h2>
          <p className="mt-2 text-sm text-muted">{rental.customer?.full_name ?? `#${rental.customer_id}`}</p>
          {rental.customer?.email ? <p className="mt-1 break-all text-sm font-semibold">{rental.customer.email}</p> : null}
        </Card>
        <Card>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h2 className="font-semibold text-foreground">Tarih aralığı</h2>
          <p className="mt-2 text-sm text-muted">{formatDate(rental.start_date)}</p>
          <p className="mt-1 text-sm font-semibold">{formatDate(rental.end_date)}</p>
        </Card>
      </div>

      {isActive ? (
        <Card>
          <h2 className="font-semibold text-foreground">Durum aksiyonları</h2>
          <p className="mt-2 text-sm text-muted">Aktif kiralamayı tamamlandı veya iptal edildi durumuna alabilirsiniz.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate(RentalStatus.COMPLETED)}
            >
              Completed yap
            </Button>
            <Button
              variant="destructive"
              loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate(RentalStatus.CANCELLED)}
            >
              Cancelled yap
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
