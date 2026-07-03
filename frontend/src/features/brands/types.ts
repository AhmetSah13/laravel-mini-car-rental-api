export type Brand = {
  id: number
  name: string
  country: string | null
  created_at?: string
  updated_at?: string
}

export type BrandListParams = {
  page?: number
  per_page?: number
}
