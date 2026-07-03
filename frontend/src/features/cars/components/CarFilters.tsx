import type { Brand } from '@/features/brands/types'
import type { CarListParams } from '@/features/cars/types'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { Button } from '@/shared/components/Button'
import { CAR_STATUS_OPTIONS } from '@/shared/types/enums'

type Props = {
  value: CarListParams
  brands: Brand[]
  onChange: (value: CarListParams) => void
  onReset: () => void
}

export function CarFilters({ value, brands, onChange, onReset }: Props) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3 lg:grid-cols-6">
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
      <div className="md:col-span-3 lg:col-span-6">
        <Button variant="secondary" size="sm" onClick={onReset}>
          Filtreleri temizle
        </Button>
      </div>
    </div>
  )
}
