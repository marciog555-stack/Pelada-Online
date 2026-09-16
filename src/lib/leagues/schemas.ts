import { z } from 'zod'

export const createLeagueSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo de 2 letras').max(60, 'Máximo de 60 letras'),
  description: z.string().trim().max(280, 'Máximo de 280 letras').optional(),
  requireApproval: z.boolean(),
})

export type CreateLeagueFormValues = z.infer<typeof createLeagueSchema>
