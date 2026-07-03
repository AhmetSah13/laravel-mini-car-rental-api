import { z } from 'zod'

export const customerSchema = z.object({
  full_name: z.string().min(1, 'Ad soyad zorunludur').max(255),
  email: z.string().email('Geçerli bir e-posta girin'),
  phone: z.string().max(30).optional().or(z.literal('')),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
