// Login usa o ID do eFootball, mas o Supabase Auth exige um e-mail.
// Geramos um e-mail sintetico invisivel ao usuario. Dominios reservados
// (RFC 2606, ex.: ".invalid") sao rejeitados pela validacao de e-mail do
// GoTrue, entao usamos um subdominio comum - nenhum e-mail e enviado de
// verdade (confirmacao de e-mail fica desligada no projeto Supabase).
const AUTH_EMAIL_DOMAIN = 'id.pelada-online.app'

export const EFOOTBALL_ID_PATTERN = /^[A-Za-z0-9_.-]{3,24}$/
export const PHONE_DIGITS_PATTERN = /^[0-9]{10,15}$/

export function normalizeEfootballId(rawId: string): string {
  return rawId.trim()
}

export function normalizePhone(rawPhone: string): string {
  return rawPhone.replace(/\D/g, '')
}

export function efootballIdToAuthEmail(efootballId: string): string {
  const normalized = normalizeEfootballId(efootballId).toLowerCase()
  return `${normalized}@${AUTH_EMAIL_DOMAIN}`
}
