import { z } from 'zod'
import { CarStatus } from '@/shared/types/enums'

export const carSchema = z.object({
  brand_id: z.number().int().positive('Marka seçin'),
  plate_number: z.string().min(1, 'Plaka zorunludur').max(20),
  model: z.string().min(1, 'Model zorunludur').max(255),
  year: z.number().int().min(1990).max(new Date().getFullYear()),
  daily_price: z.number().min(0, 'Fiyat 0 veya daha büyük olmalı'),
  status: z.enum([CarStatus.AVAILABLE, CarStatus.RENTED, CarStatus.MAINTENANCE]),
})

export type CarFormValues = z.infer<typeof carSchema>
