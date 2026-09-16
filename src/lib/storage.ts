import { supabase } from '#/lib/supabase/client'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export function assertValidImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Envie uma imagem PNG, JPG ou WebP.')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('A imagem precisa ter até 2 MB.')
  }
}

function extensionFor(file: File) {
  return file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  assertValidImage(file)
  const path = `${userId}/avatar.${extensionFor(file)}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}

export async function uploadIdClaimProof(userId: string, file: File): Promise<string> {
  assertValidImage(file)
  const path = `${userId}/${Date.now()}.${extensionFor(file)}`

  const { error: uploadError } = await supabase.storage
    .from('id-claim-proofs')
    .upload(path, file, { contentType: file.type })
  if (uploadError) throw uploadError

  return path
}

export async function uploadCrest(userId: string, file: File): Promise<string> {
  assertValidImage(file)
  const path = `${userId}/${Date.now()}.${extensionFor(file)}`

  const { error: uploadError } = await supabase.storage
    .from('crests')
    .upload(path, file, { contentType: file.type })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('crests').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadMatchProof(matchId: string, file: File): Promise<string> {
  assertValidImage(file)
  const path = `${matchId}/${Date.now()}.${extensionFor(file)}`

  const { error: uploadError } = await supabase.storage
    .from('match-proofs')
    .upload(path, file, { contentType: file.type })
  if (uploadError) throw uploadError

  return path
}

export async function getMatchProofUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('match-proofs').createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}
