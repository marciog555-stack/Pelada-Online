import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase/client'
import { useAuth } from '#/lib/auth/auth-provider'
import type { Tables } from '#/lib/supabase/types'

export type League = Tables<'leagues'>
export type LeagueMember = Tables<'league_members'>
export type LeagueMemberWithProfile = LeagueMember & {
  profile: Pick<Tables<'profiles'>, 'id' | 'efootball_id' | 'display_name' | 'avatar_url'>
}

export function useMyLeagues() {
  const { user, status } = useAuth()

  return useQuery({
    queryKey: ['leagues', 'mine', user?.id],
    enabled: status === 'signed-in' && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('league_members')
        .select('status, role, league:leagues(*)')
        .eq('user_id', user!.id)
        .order('joined_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useLeague(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['league', leagueId],
    enabled: !!leagueId,
    queryFn: async () => {
      const { data, error } = await supabase.from('leagues').select('*').eq('id', leagueId!).single()
      if (error) throw error
      return data
    },
  })
}

export function useLeagueMembers(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['league-members', leagueId],
    enabled: !!leagueId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('league_members')
        .select('*, profile:profiles(id, efootball_id, display_name, avatar_url)')
        .eq('league_id', leagueId!)
        .order('joined_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useMyMembership(leagueId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['league-membership', leagueId, user?.id],
    enabled: !!leagueId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('league_members')
        .select('*')
        .eq('league_id', leagueId!)
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useInvalidateLeague(leagueId: string | undefined) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['league', leagueId] })
    queryClient.invalidateQueries({ queryKey: ['league-members', leagueId] })
    queryClient.invalidateQueries({ queryKey: ['league-membership', leagueId] })
    queryClient.invalidateQueries({ queryKey: ['leagues', 'mine'] })
  }
}
