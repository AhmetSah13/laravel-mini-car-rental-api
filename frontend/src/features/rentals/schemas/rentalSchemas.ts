import { z } from 'zod'

export const rentalSchema = z
  .object({
    car_id: z.number().int().positive('Araç seçin'),
    customer_id: z.number().int().positive('Müşteri seçin'),
    start_date: z.string().min(1, 'Başlangıç tarihi zorunludur'),
    end_date: z.string().min(1, 'Bitiş tarihi zorunludur'),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'Bitiş tarihi başlangıçtan önce olamaz',
    path: ['end_date'],
  })

export type RentalFormValues = z.infer<typeof rentalSchema>
