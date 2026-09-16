import { z } from 'zod'

export const createSeasonSchema = z
  .object({
    name: z.string().trim().min(2, 'Mínimo de 2 letras').max(60, 'Máximo de 60 letras'),
    startsAt: z.string().min(1, 'Obrigatório'),
    endsAt: z.string().min(1, 'Obrigatório'),
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: 'O término precisa ser depois do início',
    path: ['endsAt'],
  })

export type CreateSeasonFormValues = z.infer<typeof createSeasonSchema>
