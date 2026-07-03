import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { rentalsApi } from '@/features/rentals/api/rentalsApi'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
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

  if (rentalQuery.isLoading) return <LoadingSpinner />
  if (rentalQuery.isError) return <ErrorAlert message={toApiError(rentalQuery.error).message} />
  if (!rentalQuery.data) return null

  const rental = rentalQuery.data.data
  const isActive = rental.status === RentalStatus.ACTIVE

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Kiralama #${rental.id}`}
        description="Detay ve durum güncelleme"
        actions={<RentalStatusBadge status={rental.status} />}
      />

      <Card className="max-w-2xl space-y-4">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-slate-500">Araç</dt>
            <dd className="font-medium">
              {rental.car?.model ?? `#${rental.car_id}`}
              {rental.car?.plate_number ? ` · ${rental.car.plate_number}` : ''}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Müşteri</dt>
            <dd className="font-medium">
              {rental.customer?.full_name ?? `#${rental.customer_id}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Başlangıç</dt>
            <dd className="font-medium">{formatDate(rental.start_date)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Bitiş</dt>
            <dd className="font-medium">{formatDate(rental.end_date)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Toplam</dt>
            <dd className="font-medium">{formatPrice(rental.total_price)}</dd>
          </div>
        </dl>

        {isActive ? (
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button
              variant="primary"
              loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate(RentalStatus.COMPLETED)}
            >
              Completed yap
            </Button>
            <Button
              variant="danger"
              loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate(RentalStatus.CANCELLED)}
            >
              Cancelled yap
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
