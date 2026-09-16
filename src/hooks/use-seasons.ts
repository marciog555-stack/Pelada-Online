import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase/client'
import type { Tables } from '#/lib/supabase/types'

export type Season = Tables<'seasons'>

export function useSeasons() {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seasons').select('*').order('starts_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useSeason(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['season', seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      const { data, error } = await supabase.from('seasons').select('*').eq('id', seasonId!).single()
      if (error) throw error
      return data
    },
  })
}

export function useGlobalRanking(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['global-ranking', seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('global_season_ranking', { p_season_id: seasonId! })
      if (error) throw error
      return data
    },
  })
}

export function useIsPlatformAdmin() {
  return useQuery({
    queryKey: ['is-platform-admin'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_platform_admin')
      if (error) throw error
      return data
    },
  })
}

export function useInvalidateSeasons() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['seasons'] })
}
