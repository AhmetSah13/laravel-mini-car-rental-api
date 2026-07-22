import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import type { Brand } from '@/features/brands/types'
import type { CarListParams } from '@/features/cars/types'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { CAR_STATUS_OPTIONS } from '@/shared/types/enums'

type Props = {
  value: CarListParams
  brands: Brand[]
  onChange: (value: CarListParams) => void
  onReset: () => void
}

export function CarFilters({ value, brands, onChange, onReset }: Props) {
  const [open, setOpen] = useState(false)
  const activeCount = [
    value.brand_id,
    value.status,
    value.min_price,
    value.max_price,
    value.sort_by,
    value.sort_direction && value.sort_direction !== 'asc' ? value.sort_direction : undefined,
  ].filter(Boolean).length

  const fields = (
    <>
      <Select
        label="Marka"
        placeholder="Tümü"
        value={value.brand_id ?? ''}
        onChange={(e) => onChange({ ...value, brand_id: e.target.value, page: 1 })}
        options={brands.map((b) => ({ value: b.id, label: b.name }))}
      />
      <Select
        label="Durum"
        placeholder="Tümü"
        value={value.status ?? ''}
        onChange={(e) =>
          onChange({ ...value, status: e.target.value as CarListParams['status'], page: 1 })
        }
        options={CAR_STATUS_OPTIONS}
      />
      <Input
        label="Min fiyat"
        type="number"
        value={value.min_price ?? ''}
        onChange={(e) => onChange({ ...value, min_price: e.target.value, page: 1 })}
      />
      <Input
        label="Max fiyat"
        type="number"
        value={value.max_price ?? ''}
        onChange={(e) => onChange({ ...value, max_price: e.target.value, page: 1 })}
      />
      <Select
        label="Sırala"
        value={value.sort_by ?? ''}
        onChange={(e) =>
          onChange({ ...value, sort_by: e.target.value as CarListParams['sort_by'], page: 1 })
        }
        options={[
          { value: 'daily_price', label: 'Günlük fiyat' },
          { value: 'year', label: 'Yıl' },
          { value: 'created_at', label: 'Oluşturma' },
          { value: 'id', label: 'ID' },
        ]}
        placeholder="Varsayılan"
      />
      <Select
        label="Yön"
        value={value.sort_direction ?? 'asc'}
        onChange={(e) =>
          onChange({
            ...value,
            sort_direction: e.target.value as CarListParams['sort_direction'],
            page: 1,
          })
        }
        options={[
          { value: 'asc', label: 'Artan' },
          { value: 'desc', label: 'Azalan' },
        ]}
      />
    </>
  )

  return (
    <div className="rounded-card border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold">Filtreler</span>
          {activeCount ? <Badge variant="primary">{activeCount} aktif</Badge> : null}
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-4 w-4" /> : 'Aç'}
        </Button>
      </div>

      <div className={(open ? 'mt-4 grid' : 'hidden') + ' gap-3 md:mt-0 md:grid md:grid-cols-3 lg:grid-cols-6'}>
        {fields}
        <div className="flex items-end md:col-span-3 lg:col-span-6">
          <Button variant="outline" size="sm" onClick={onReset}>
            Filtreleri temizle
          </Button>
        </div>
      </div>
    </div>
  )
}
