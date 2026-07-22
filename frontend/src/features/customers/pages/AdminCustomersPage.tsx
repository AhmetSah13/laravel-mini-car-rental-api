import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customersApi } from '@/features/customers/api/customersApi'
import { customerSchema, type CustomerFormValues } from '@/features/customers/schemas/customerSchemas'
import type { Customer } from '@/features/customers/types'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { EmptyState } from '@/shared/components/EmptyState'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Pagination } from '@/shared/components/Pagination'
import { SkeletonRows } from '@/shared/components/Skeleton'
import { applyApiFieldErrors } from '@/shared/lib/formErrors'
import { toApiError } from '@/shared/lib/errors'

const emptyForm: CustomerFormValues = { full_name: '', email: '', phone: '' }

export function AdminCustomersPage() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState<Customer | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: emptyForm,
  })

  const listQuery = useQuery({
    queryKey: ['admin', 'customers', page],
    queryFn: () => customersApi.list({ page, per_page: 10 }),
  })

  const saveMutation = useMutation({
    mutationFn: (values: CustomerFormValues) => {
      const payload = {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || null,
      }
      return editing ? customersApi.update(editing.id, payload) : customersApi.create(payload)
    },
    onSuccess: (response) => {
      toast.success(response.message)
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      form.reset(emptyForm)
      setEditing(null)
    },
    onError: (error) => {
      if (toApiError(error).status === 422) applyApiFieldErrors(form.setError, error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customersApi.remove(id),
    onSuccess: (response) => {
      toast.success(response.message)
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setDeleting(null)
    },
  })

  function startEdit(customer: Customer) {
    setEditing(customer)
    form.reset({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone ?? '',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Admin · Müşteriler" description="Kiralama işlemlerinde kullanılan müşteri kayıtlarını yönetin." />

      <Card>
        <h2 className="mb-4 text-base font-semibold">
          {editing ? `Müşteri güncelle #${editing.id}` : 'Yeni müşteri'}
        </h2>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        >
          <Input
            label="Ad soyad"
            error={form.formState.errors.full_name?.message}
            {...form.register('full_name')}
          />
          <Input
            label="E-posta"
            type="email"
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />
          <Input
            label="Telefon"
            error={form.formState.errors.phone?.message}
            {...form.register('phone')}
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

      {listQuery.isLoading ? <SkeletonRows rows={5} /> : null}
      {listQuery.isError ? <ErrorAlert message={toApiError(listQuery.error).message} /> : null}
      {listQuery.data && listQuery.data.data.length === 0 ? (
        <EmptyState title="Müşteri kaydı yok" description="Yeni müşteri oluşturduğunuzda burada listelenir." />
      ) : null}

      {listQuery.data && listQuery.data.data.length > 0 ? (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.data.data.map((customer) => (
                <tr key={customer.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{customer.id}</td>
                  <td className="px-4 py-3 font-medium">{customer.full_name}</td>
                  <td className="px-4 py-3">{customer.email}</td>
                  <td className="px-4 py-3">{customer.phone ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(customer)}>
                        Düzenle
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(customer)}>
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
        title="Müşteriyi sil"
        description={deleting ? `"${deleting.full_name}" silinecek.` : undefined}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  )
}
