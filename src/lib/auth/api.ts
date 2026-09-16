import { supabase } from '#/lib/supabase/client'
import { efootballIdToAuthEmail, normalizeEfootballId } from '#/lib/auth/efootball'

export interface SignUpInput {
  efootballId: string
  password: string
  displayName: string
  nickname?: string
  platform: 'ps' | 'xbox' | 'pc' | 'mobile'
  phone: string
  state?: string
  city?: string
}

export async function checkEfootballIdAvailable(efootballId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_efootball_id_available', {
    p_efootball_id: normalizeEfootballId(efootballId),
  })
  if (error) throw error
  return data
}

export async function checkPhoneAvailable(phone: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_phone_available', { p_phone: phone })
  if (error) throw error
  return data
}

export async function findProfileIdByEfootballId(efootballId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('efootball_id', normalizeEfootballId(efootballId))
    .maybeSingle()
  if (error) throw error
  return data?.id ?? null
}

export async function signUpWithEfootballId(input: SignUpInput) {
  const efootballId = normalizeEfootballId(input.efootballId)
  return supabase.auth.signUp({
    email: efootballIdToAuthEmail(efootballId),
    password: input.password,
    options: {
      data: {
        efootball_id: efootballId,
        display_name: input.displayName,
        nickname: input.nickname || '',
        platform: input.platform,
        phone: input.phone,
        state: input.state || '',
        city: input.city || '',
      },
    },
  })
}

export async function signInWithEfootballId(efootballId: string, password: string) {
  return supabase.auth.signInWithPassword({
    email: efootballIdToAuthEmail(efootballId),
    password,
  })
}
