import { z } from 'zod'

export const brandSchema = z.object({
  name: z.string().min(1, 'Marka adı zorunludur').max(255),
  country: z.string().max(255).optional().or(z.literal('')),
})

export type BrandFormValues = z.infer<typeof brandSchema>
