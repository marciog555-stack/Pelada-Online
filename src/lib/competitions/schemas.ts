import { z } from 'zod'

export const PRESET_OPTIONS = [
  { value: 'brasileirao-serie-a', label: 'Brasileirão (pontos corridos)' },
  { value: 'mata-mata-simples', label: 'Mata-mata simples' },
  { value: 'premier-league', label: 'Premier League (pontos corridos, ida e volta)' },
  { value: 'bundesliga', label: 'Bundesliga (pontos corridos, ida e volta)' },
  { value: 'champions-league-swiss', label: 'Champions League (fase de liga, formato suíço)' },
] as const

export const createCompetitionSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo de 2 letras').max(60, 'Máximo de 60 letras'),
  presetId: z.enum([
    'brasileirao-serie-a',
    'mata-mata-simples',
    'premier-league',
    'bundesliga',
    'champions-league-swiss',
  ]),
})

export type CreateCompetitionFormValues = z.infer<typeof createCompetitionSchema>

export const joinEditionSchema = z.object({
  teamName: z.string().trim().min(2, 'Mínimo de 2 letras').max(40, 'Máximo de 40 letras'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
})

export type JoinEditionFormValues = z.infer<typeof joinEditionSchema>

export const EVENT_TYPE_OPTIONS = [
  { value: 'goal', label: 'Gol' },
  { value: 'yellow_card', label: 'Cartão amarelo' },
  { value: 'red_card', label: 'Cartão vermelho' },
] as const

export const matchEventSchema = z.object({
  participantId: z.string(),
  eventType: z.enum(['goal', 'yellow_card', 'red_card']),
  athleteName: z.string().trim().min(1, 'Obrigatório').max(60),
  assistAthleteName: z.string().trim().max(60).optional(),
})

export type MatchEventFormValues = z.infer<typeof matchEventSchema>

export const matchReportSchema = z.object({
  homeGoals: z.number().int().min(0).max(50),
  awayGoals: z.number().int().min(0).max(50),
  homeRedCards: z.number().int().min(0).max(11),
  awayRedCards: z.number().int().min(0).max(11),
  homeYellowCards: z.number().int().min(0).max(11),
  awayYellowCards: z.number().int().min(0).max(11),
  message: z.string().trim().max(300).optional(),
})

export type MatchReportFormValues = z.infer<typeof matchReportSchema>
