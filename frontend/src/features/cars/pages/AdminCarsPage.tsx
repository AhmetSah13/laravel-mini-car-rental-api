import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { carsApi } from '@/features/cars/api/carsApi'
import { brandsApi } from '@/features/brands/api/brandsApi'
import { useCarRealtime } from '@/features/cars/hooks/useCarRealtime'
import { carSchema, type CarFormValues } from '@/features/cars/schemas/carSchemas'
import type { Car } from '@/features/cars/types'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { Button } from '@/shared/components/Button'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { EmptyState } from '@/shared/components/EmptyState'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Pagination } from '@/shared/components/Pagination'
import { CarStatusBadge } from '@/shared/components/StatusBadge'
import { SkeletonRows } from '@/shared/components/Skeleton'
import { CAR_STATUS_OPTIONS, CarStatus } from '@/shared/types/enums'
import { formatPrice } from '@/shared/lib/format'
import { applyApiFieldErrors } from '@/shared/lib/formErrors'
import { toApiError } from '@/shared/lib/errors'

const emptyForm: CarFormValues = {
  brand_id: 0,
  plate_number: '',
  model: '',
  year: new Date().getFullYear(),
  daily_price: 0,
  status: CarStatus.AVAILABLE,
}

export function AdminCarsPage() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Car | null>(null)
  const [deleting, setDeleting] = useState<Car | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: emptyForm,
  })

  const brandsQuery = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => brandsApi.list({ per_page: 100 }),
  })

  const listQuery = useQuery({
    queryKey: ['admin', 'cars', page],
    queryFn: () => carsApi.list({ page, per_page: 10 }),
  })

  useCarRealtime(() => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] })
    void queryClient.invalidateQueries({ queryKey: ['cars'] })
    toast.info('Yeni araç kaydı alındı.')
  })

  const saveMutation = useMutation({

    mutationFn: (values: CarFormValues) =>
      editing ? carsApi.update(editing.id, values) : carsApi.create(values),
    onSuccess: (response) => {
      toast.success(response.message)
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      form.reset(emptyForm)
      setEditing(null)
    },
    onError: (error) => {
      if (toApiError(error).status === 422) applyApiFieldErrors(form.setError, error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => carsApi.remove(id),
    onSuccess: (response) => {
      toast.success(response.message)
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      setDeleting(null)
    },
  })

  function startEdit(car: Car) {
    setEditing(car)
    form.reset({
      brand_id: car.brand_id,
      plate_number: car.plate_number,
      model: car.model,
      year: car.year,
      daily_price: Number(car.daily_price),
      status: car.status,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Admin · Araçlar" description="Filo araçlarını, fiyatlarını ve müsaitlik durumlarını yönetin." />

      <Card>
        <h2 className="mb-4 text-base font-semibold">
          {editing ? `Araç güncelle #${editing.id}` : 'Yeni araç'}
        </h2>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        >
          <Select
            label="Marka"
            placeholder="Seçin"
            error={form.formState.errors.brand_id?.message}
            options={(brandsQuery.data?.data ?? []).map((b) => ({ value: b.id, label: b.name }))}
            {...form.register('brand_id', { valueAsNumber: true })}
          />
          <Input
            label="Plaka"
            error={form.formState.errors.plate_number?.message}
            {...form.register('plate_number')}
          />
          <Input label="Model" error={form.formState.errors.model?.message} {...form.register('model')} />
          <Input
            label="Yıl"
            type="number"
            error={form.formState.errors.year?.message}
            {...form.register('year', { valueAsNumber: true })}
          />
          <Input
            label="Günlük fiyat"
            type="number"
            step="0.01"
            error={form.formState.errors.daily_price?.message}
            {...form.register('daily_price', { valueAsNumber: true })}
          />

          <Select
            label="Durum"
            error={form.formState.errors.status?.message}
            options={CAR_STATUS_OPTIONS}
            {...form.register('status')}
          />
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'Güncelle' : 'Oluştur'}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(null)
                  form.reset(emptyForm)
                }}
              >
                İptal
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      {listQuery.isLoading ? <SkeletonRows rows={6} /> : null}
      {listQuery.isError ? <ErrorAlert message={toApiError(listQuery.error).message} /> : null}
      {listQuery.data && listQuery.data.data.length === 0 ? (
        <EmptyState title="Araç kaydı yok" description="Yeni araç oluşturduğunuzda burada listelenir." />
      ) : null}

      {listQuery.data && listQuery.data.data.length > 0 ? (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Plaka</th>
                <th className="px-4 py-3">Fiyat</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.data.data.map((car) => (
                <tr key={car.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{car.id}</td>
                  <td className="px-4 py-3 font-medium">{car.model}</td>
                  <td className="px-4 py-3">{car.plate_number}</td>
                  <td className="px-4 py-3">{formatPrice(car.daily_price)}</td>
                  <td className="px-4 py-3">
                    <CarStatusBadge status={car.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(car)}>
                        Düzenle
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(car)}>
                        Sil
                      </Button>
                    </div>
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

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Aracı sil"
        description={deleting ? `"${deleting.plate_number}" silinecek.` : undefined}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  )
}
