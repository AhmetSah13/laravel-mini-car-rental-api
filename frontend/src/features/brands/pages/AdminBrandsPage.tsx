import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { brandsApi } from '@/features/brands/api/brandsApi'
import { brandSchema, type BrandFormValues } from '@/features/brands/schemas/brandSchemas'
import type { Brand } from '@/features/brands/types'
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

export function AdminBrandsPage() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [deleting, setDeleting] = useState<Brand | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: '', country: '' },
  })

  const listQuery = useQuery({
    queryKey: ['admin', 'brands', page],
    queryFn: () => brandsApi.list({ page, per_page: 10 }),
  })

  const saveMutation = useMutation({
    mutationFn: (values: BrandFormValues) => {
      const payload = {
        name: values.name,
        country: values.country || null,
      }
      return editing ? brandsApi.update(editing.id, payload) : brandsApi.create(payload)
    },
    onSuccess: (response) => {
      toast.success(response.message)
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] })
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      form.reset({ name: '', country: '' })
      setEditing(null)
    },
    onError: (error) => {
      if (toApiError(error).status === 422) applyApiFieldErrors(form.setError, error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => brandsApi.remove(id),
    onSuccess: (response) => {
      toast.success(response.message)
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] })
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      setDeleting(null)
    },
  })

  function startEdit(brand: Brand) {
    setEditing(brand)
    form.reset({ name: brand.name, country: brand.country ?? '' })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Admin · Markalar" description="Filo kataloğunda kullanılan marka kayıtlarını yönetin." />

      <Card>
        <h2 className="mb-4 text-base font-semibold">
          {editing ? `Marka güncelle #${editing.id}` : 'Yeni marka'}
        </h2>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        >
          <Input label="Ad" error={form.formState.errors.name?.message} {...form.register('name')} />
          <Input
            label="Ülke"
            error={form.formState.errors.country?.message}
            {...form.register('country')}
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
                  form.reset({ name: '', country: '' })
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
        <EmptyState title="Marka kaydı yok" description="Yeni marka oluşturduğunuzda burada listelenir." />
      ) : null}

      {listQuery.data && listQuery.data.data.length > 0 ? (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Ülke</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.data.data.map((brand) => (
                <tr key={brand.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{brand.id}</td>
                  <td className="px-4 py-3 font-medium">{brand.name}</td>
                  <td className="px-4 py-3">{brand.country ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(brand)}>
                        Düzenle
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(brand)}>
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
        title="Markayı sil"
        description={deleting ? `"${deleting.name}" silinecek.` : undefined}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  )
}
