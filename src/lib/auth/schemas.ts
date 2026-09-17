import { z } from 'zod'
import { EFOOTBALL_ID_PATTERN, PHONE_DIGITS_PATTERN, normalizePhone } from '#/lib/auth/efootball'

export const PLATFORM_OPTIONS = [
  { value: 'ps', label: 'PlayStation' },
  { value: 'xbox', label: 'Xbox' },
  { value: 'pc', label: 'PC' },
  { value: 'mobile', label: 'Celular' },
] as const

export const loginSchema = z.object({
  efootballId: z.string().trim().min(1, 'Informe seu ID do eFootball'),
  password: z.string().min(1, 'Informe sua senha'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    efootballId: z
      .string()
      .trim()
      .regex(EFOOTBALL_ID_PATTERN, 'Use de 3 a 24 letras, números, ponto, traço ou underline'),
    password: z.string().min(6, 'Mínimo de 6 caracteres'),
    confirmPassword: z.string(),
    displayName: z.string().trim().min(2, 'Conta seu nome no jogo'),
    nickname: z.string().trim().optional(),
    platform: z.enum(['ps', 'xbox', 'pc', 'mobile']),
    phone: z
      .string()
      .transform(normalizePhone)
      .refine((value) => PHONE_DIGITS_PATTERN.test(value), 'Celular inválido (DDD + número)'),
    state: z.string().trim().optional(),
    city: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type SignupFormValues = z.infer<typeof signupSchema>

export const idClaimSchema = z.object({
  message: z.string().trim().max(500).optional(),
})

export type IdClaimFormValues = z.infer<typeof idClaimSchema>

export const profileEditSchema = z.object({
  displayName: z.string().trim().min(2, 'Conta seu nome no jogo'),
  nickname: z.string().trim().optional(),
  platform: z.enum(['ps', 'xbox', 'pc', 'mobile']),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
})

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>
