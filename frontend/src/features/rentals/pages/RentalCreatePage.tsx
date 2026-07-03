import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { rentalsApi } from '@/features/rentals/api/rentalsApi'
import { carsApi } from '@/features/cars/api/carsApi'
import { customersApi } from '@/features/customers/api/customersApi'
import { rentalSchema, type RentalFormValues } from '@/features/rentals/schemas/rentalSchemas'
import { useAuthStore } from '@/features/auth/store'
import { UserRole, CarStatus } from '@/shared/types/enums'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Select } from '@/shared/components/Select'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { applyApiFieldErrors } from '@/shared/lib/formErrors'
import { toApiError } from '@/shared/lib/errors'

export function RentalCreatePage() {
  const isAdmin = useAuthStore((s) => s.user?.role === UserRole.ADMIN)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<RentalFormValues>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      car_id: 0,
      customer_id: 0,
      start_date: '',
      end_date: '',
    },
  })

  const carsQuery = useQuery({
    queryKey: ['cars', { status: CarStatus.AVAILABLE }],
    queryFn: () => carsApi.list({ status: CarStatus.AVAILABLE, per_page: 100 }),
    enabled: isAdmin,
  })

  const customersQuery = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: () => customersApi.list({ per_page: 100 }),
    enabled: isAdmin,
  })

  const createMutation = useMutation({
    mutationFn: (values: RentalFormValues) => rentalsApi.create(values),
    onSuccess: (response) => {
      toast.success(response.message)
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      navigate(`/rentals/${response.data.id}`)
    },
    onError: (error) => {
      if (toApiError(error).status === 422) applyApiFieldErrors(form.setError, error)
    },
  })

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <PageHeader title="Yeni kiralama" />
        <ErrorAlert message="Rental oluşturmak için customer listesi gerekir. Customers endpointleri yalnızca admin rolüne açıktır. Backend değiştirilmedi; bu sayfa admin-first tasarlandı." />
      </div>
    )
  }

  if (carsQuery.isLoading || customersQuery.isLoading) return <LoadingSpinner />

  if (customersQuery.isError) {
    return <ErrorAlert message={toApiError(customersQuery.error).message} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yeni kiralama"
        description="Admin-first: available araçlar ve müşteri listesi kullanılır."
      />

      <Card className="max-w-2xl">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
        >
          <Select
            label="Araç (available)"
            placeholder="Seçin"
            error={form.formState.errors.car_id?.message}
            options={(carsQuery.data?.data ?? []).map((car) => ({
              value: car.id,
              label: `${car.model} · ${car.plate_number}`,
            }))}
            {...form.register('car_id', { valueAsNumber: true })}
          />
          <Select
            label="Müşteri"
            placeholder="Seçin"
            error={form.formState.errors.customer_id?.message}
            options={(customersQuery.data?.data ?? []).map((customer) => ({
              value: customer.id,
              label: `${customer.full_name} · ${customer.email}`,
            }))}
            {...form.register('customer_id', { valueAsNumber: true })}
          />
          <Input
            label="Başlangıç"
            type="date"
            error={form.formState.errors.start_date?.message}
            {...form.register('start_date')}
          />
          <Input
            label="Bitiş"
            type="date"
            error={form.formState.errors.end_date?.message}
            {...form.register('end_date')}
          />
          <div className="md:col-span-2">
            <Button type="submit" loading={createMutation.isPending}>
              Oluştur
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
