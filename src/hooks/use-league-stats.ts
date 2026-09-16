import { useQuery } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase/client'

export function useLeaguePlayerStats(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['league-player-stats', leagueId],
    enabled: !!leagueId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('league_player_stats', { p_league_id: leagueId! })
      if (error) throw error
      return data
    },
  })
}

export function useLeagueTopScorers(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['league-top-scorers', leagueId],
    enabled: !!leagueId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('league_top_scorers', { p_league_id: leagueId! })
      if (error) throw error
      return data
    },
  })
}
