export type Customer = {
  id: number
  full_name: string
  email: string
  phone: string | null
  created_at?: string
  updated_at?: string
}

export type CustomerListParams = {
  page?: number
  per_page?: number
}
