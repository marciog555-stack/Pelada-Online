import { z } from 'zod'

export const createMundialSchema = z.object({
  seasonId: z.string().min(1, 'Selecione uma temporada'),
  name: z.string().trim().min(2, 'Mínimo de 2 letras').max(60, 'Máximo de 60 letras'),
  maxSlots: z.string().trim().max(3).optional(),
})

export type CreateMundialFormValues = z.infer<typeof createMundialSchema>
