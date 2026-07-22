import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2, Hash, MapPin } from 'lucide-react'
import { brandsApi } from '@/features/brands/api/brandsApi'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { Skeleton } from '@/shared/components/Skeleton'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { toApiError } from '@/shared/lib/errors'

export function BrandDetailPage() {
  const { id } = useParams()

  const brandQuery = useQuery({
    queryKey: ['brands', id],
    queryFn: () => brandsApi.get(id!),
    enabled: Boolean(id),
  })

  if (brandQuery.isLoading) return <Skeleton className="h-52 max-w-lg" />
  if (brandQuery.isError) return <ErrorAlert message={toApiError(brandQuery.error).message} />
  if (!brandQuery.data) return null

  const brand = brandQuery.data.data

  return (
    <div>
      <PageHeader
        title={brand.name}
        description="Marka detay bilgileri"
        actions={
          <Link to="/brands">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Markalara dön
            </Button>
          </Link>
        }
      />
      <Card className="max-w-2xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-primary">
          <Building2 className="h-6 w-6" />
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
              <MapPin className="h-4 w-4" /> Ülke
            </dt>
            <dd className="mt-2 font-semibold">{brand.country ?? '-'}</dd>
          </div>
          <div className="rounded-md border border-border p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
              <Hash className="h-4 w-4" /> ID
            </dt>
            <dd className="mt-2 font-semibold">{brand.id}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
