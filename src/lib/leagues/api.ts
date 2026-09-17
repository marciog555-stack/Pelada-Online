import { supabase } from '#/lib/supabase/client'
import type { TablesUpdate } from '#/lib/supabase/types'

export async function createLeague(input: {
  name: string
  description?: string
  requireApproval: boolean
  ownerId: string
}) {
  const { data, error } = await supabase
    .from('leagues')
    .insert({
      name: input.name,
      description: input.description || null,
      require_approval: input.requireApproval,
      owner_id: input.ownerId,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getLeaguePreview(inviteCode: string) {
  const { data, error } = await supabase.rpc('get_league_preview_by_invite_code', {
    p_invite_code: inviteCode,
  })
  if (error) throw error
  return data[0] ?? null
}

export async function joinLeagueByInviteCode(inviteCode: string) {
  const { data, error } = await supabase.rpc('join_league_by_invite_code', {
    p_invite_code: inviteCode,
  })
  if (error) throw error
  return data
}

export async function approveMember(memberId: string) {
  const { error } = await supabase.from('league_members').update({ status: 'active' }).eq('id', memberId)
  if (error) throw error
}

export async function removeMember(memberId: string) {
  const { error } = await supabase.from('league_members').delete().eq('id', memberId)
  if (error) throw error
}

export async function setMemberRole(memberId: string, role: 'admin' | 'member') {
  const { error } = await supabase.from('league_members').update({ role }).eq('id', memberId)
  if (error) throw error
}

export async function leaveLeague(memberId: string) {
  const { error } = await supabase.from('league_members').delete().eq('id', memberId)
  if (error) throw error
}

export async function regenerateInviteCode(leagueId: string) {
  const code = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  const { data, error } = await supabase
    .from('leagues')
    .update({ invite_code: code })
    .eq('id', leagueId)
    .select('invite_code')
    .single()
  if (error) throw error
  return data.invite_code
}

export async function updateLeagueSettings(
  leagueId: string,
  updates: { name?: string; description?: string | null; requireApproval?: boolean },
) {
  const payload: TablesUpdate<'leagues'> = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.requireApproval !== undefined) payload.require_approval = updates.requireApproval

  const { error } = await supabase.from('leagues').update(payload).eq('id', leagueId)
  if (error) throw error
}
