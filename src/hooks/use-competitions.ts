import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase/client'
import { useAuth } from '#/lib/auth/auth-provider'
import type { Tables } from '#/lib/supabase/types'

export type Competition = Tables<'competitions'>
export type Edition = Tables<'editions'>
export type EditionParticipant = Tables<'edition_participants'>
export type Match = Tables<'matches'>
export type MatchReport = Tables<'match_reports'>
export type MatchEvent = Tables<'match_events'>
export type CrestChangeRequest = Tables<'crest_change_requests'>

export function useLeagueCompetitions(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['competitions', leagueId],
    enabled: !!leagueId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('league_id', leagueId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCompetition(competitionId: string | undefined) {
  return useQuery({
    queryKey: ['competition', competitionId],
    enabled: !!competitionId,
    queryFn: async () => {
      const { data, error } = await supabase.from('competitions').select('*').eq('id', competitionId!).single()
      if (error) throw error
      return data
    },
  })
}

export function useCompetitionEditions(competitionId: string | undefined) {
  return useQuery({
    queryKey: ['editions', competitionId],
    enabled: !!competitionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .eq('competition_id', competitionId!)
        .order('number', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useEdition(editionId: string | undefined) {
  return useQuery({
    queryKey: ['edition', editionId],
    enabled: !!editionId,
    queryFn: async () => {
      const { data, error } = await supabase.from('editions').select('*').eq('id', editionId!).single()
      if (error) throw error
      return data
    },
  })
}

export function useEditionParticipants(editionId: string | undefined) {
  return useQuery({
    queryKey: ['edition-participants', editionId],
    enabled: !!editionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edition_participants')
        .select('*, profile:profiles(id, efootball_id, display_name, avatar_url)')
        .eq('edition_id', editionId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useMyEditionParticipant(editionId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['edition-participant-mine', editionId, user?.id],
    enabled: !!editionId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edition_participants')
        .select('*')
        .eq('edition_id', editionId!)
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useEditionMatches(editionId: string | undefined) {
  return useQuery({
    queryKey: ['edition-matches', editionId],
    enabled: !!editionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(
          '*, home:edition_participants!matches_home_participant_id_fkey(id, team_name, crest_url, primary_color), away:edition_participants!matches_away_participant_id_fkey(id, team_name, crest_url, primary_color)',
        )
        .eq('edition_id', editionId!)
        .order('round', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useMatch(matchId: string | undefined) {
  return useQuery({
    queryKey: ['match', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(
          '*, home:edition_participants!matches_home_participant_id_fkey(id, team_name, crest_url, primary_color, user_id), away:edition_participants!matches_away_participant_id_fkey(id, team_name, crest_url, primary_color, user_id)',
        )
        .eq('id', matchId!)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useMatchReports(matchId: string | undefined) {
  return useQuery({
    queryKey: ['match-reports', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_reports')
        .select('*')
        .eq('match_id', matchId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useMatchEvents(matchId: string | undefined) {
  return useQuery({
    queryKey: ['match-events', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', matchId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useCrestChangeRequests(editionId: string | undefined) {
  return useQuery({
    queryKey: ['crest-requests', editionId],
    enabled: !!editionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crest_change_requests')
        .select('*, participant:edition_participants!inner(id, edition_id, team_name)')
        .eq('participant.edition_id', editionId!)
        .eq('status', 'pending')
      if (error) throw error
      return data
    },
  })
}

export function useInvalidateCompetitions(leagueId: string | undefined) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['competitions', leagueId] })
}

export function useInvalidateEdition(editionId: string | undefined) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['edition', editionId] })
    queryClient.invalidateQueries({ queryKey: ['edition-participants', editionId] })
    queryClient.invalidateQueries({ queryKey: ['edition-participant-mine', editionId] })
    queryClient.invalidateQueries({ queryKey: ['edition-matches', editionId] })
    queryClient.invalidateQueries({ queryKey: ['crest-requests', editionId] })
  }
}

export function useInvalidateMatch(matchId: string | undefined) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['match', matchId] })
    queryClient.invalidateQueries({ queryKey: ['match-reports', matchId] })
    queryClient.invalidateQueries({ queryKey: ['match-events', matchId] })
  }
}
