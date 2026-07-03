export function formatPrice(value: string | number | null | undefined): string {
  const amount = typeof value === 'string' ? Number(value) : (value ?? 0)
  if (Number.isNaN(amount)) return String(value ?? '-')
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  return value
}
