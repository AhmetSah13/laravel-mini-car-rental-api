import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { brandsApi } from '@/features/brands/api/brandsApi'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { toApiError } from '@/shared/lib/errors'

export function BrandDetailPage() {
  const { id } = useParams()

  const brandQuery = useQuery({
    queryKey: ['brands', id],
    queryFn: () => brandsApi.get(id!),
    enabled: Boolean(id),
  })

  if (brandQuery.isLoading) return <LoadingSpinner />
  if (brandQuery.isError) return <ErrorAlert message={toApiError(brandQuery.error).message} />
  if (!brandQuery.data) return null

  const brand = brandQuery.data.data

  return (
    <div>
      <PageHeader title={brand.name} description="Marka detayı" />
      <Card className="max-w-lg space-y-3">
        <div>
          <p className="text-xs uppercase text-slate-500">Ülke</p>
          <p className="font-medium">{brand.country ?? '-'}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">ID</p>
          <p className="font-medium">{brand.id}</p>
        </div>
      </Card>
    </div>
  )
}
