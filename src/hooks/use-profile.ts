import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase/client'
import { useAuth } from '#/lib/auth/auth-provider'
import type { Tables } from '#/lib/supabase/types'

export type Profile = Tables<'profiles'>

export function profileQueryKey(efootballId: string) {
  return ['profile', efootballId.toLowerCase()] as const
}

export function useOwnProfile() {
  const { user, status } = useAuth()

  return useQuery({
    queryKey: ['profile', 'me', user?.id],
    enabled: status === 'signed-in' && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function usePublicProfile(efootballId: string | undefined) {
  return useQuery({
    queryKey: efootballId ? profileQueryKey(efootballId) : ['profile', 'unknown'],
    enabled: !!efootballId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('efootball_id', efootballId!)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useInvalidateOwnProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return () => queryClient.invalidateQueries({ queryKey: ['profile', 'me', user?.id] })
}

export function usePlayerCareerSummary(userId: string | undefined) {
  return useQuery({
    queryKey: ['player-career-summary', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('player_career_summary', { p_user_id: userId! })
      if (error) throw error
      return data[0] ?? null
    },
  })
}

export function usePlayerCareerHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['player-career-history', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('player_career_history', { p_user_id: userId! })
      if (error) throw error
      return data
    },
  })
}

export function usePlayerAchievements(userId: string | undefined) {
  return useQuery({
    queryKey: ['player-achievements', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('player_achievements', { p_user_id: userId! })
      if (error) throw error
      return data
    },
  })
}

export function usePlayerTitlesByPreset(userId: string | undefined) {
  return useQuery({
    queryKey: ['player-titles-by-preset', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('player_titles_by_preset', { p_user_id: userId! })
      if (error) throw error
      return data
    },
  })
}

export function usePlayerRecentForm(userId: string | undefined, limit = 5) {
  return useQuery({
    queryKey: ['player-recent-form', userId, limit],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('player_recent_form', { p_user_id: userId!, p_limit: limit })
      if (error) throw error
      return data
    },
  })
}

export function usePlayerNextMatch(userId: string | undefined) {
  return useQuery({
    queryKey: ['player-next-match', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('player_next_match', { p_user_id: userId! })
      if (error) throw error
      return data[0] ?? null
    },
  })
}

export function usePlayerMatchStatsSummary(userId: string | undefined) {
  return useQuery({
    queryKey: ['player-match-stats-summary', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('player_match_stats_summary', { p_user_id: userId! })
      if (error) throw error
      return data[0] ?? null
    },
  })
}
