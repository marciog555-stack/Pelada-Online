import { supabase } from '#/lib/supabase/client'

export async function createSeason(input: {
  name: string
  startsAt: string
  endsAt: string
  createdBy: string
}) {
  const { data, error } = await supabase
    .from('seasons')
    .insert({
      name: input.name,
      starts_at: new Date(input.startsAt).toISOString(),
      ends_at: new Date(input.endsAt).toISOString(),
      created_by: input.createdBy,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
