import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase/client'
import type { Tables } from '#/lib/supabase/types'

export type Mundial = Tables<'mundials'>
export type MundialSlot = Tables<'mundial_slots'>
export type MundialMatch = Tables<'mundial_matches'>

export function useMundials() {
  return useQuery({
    queryKey: ['mundials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mundials')
        .select('*, season:seasons(id, name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useMundial(mundialId: string | undefined) {
  return useQuery({
    queryKey: ['mundial', mundialId],
    enabled: !!mundialId,
    queryFn: async () => {
      const { data, error } = await supabase.from('mundials').select('*').eq('id', mundialId!).single()
      if (error) throw error
      return data
    },
  })
}

export function useMundialSlots(mundialId: string | undefined) {
  return useQuery({
    queryKey: ['mundial-slots', mundialId],
    enabled: !!mundialId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mundial_slots')
        .select('*, league:leagues(id, name), profile:profiles(id, display_name, efootball_id)')
        .eq('mundial_id', mundialId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useMundialEligibleChampions(mundialId: string | undefined) {
  return useQuery({
    queryKey: ['mundial-eligible', mundialId],
    enabled: !!mundialId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('mundial_eligible_champions', { p_mundial_id: mundialId! })
      if (error) throw error
      return data
    },
  })
}

export function useMundialMatches(mundialId: string | undefined) {
  return useQuery({
    queryKey: ['mundial-matches', mundialId],
    enabled: !!mundialId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mundial_matches')
        .select(
          '*, home:mundial_slots!mundial_matches_home_slot_id_fkey(id, team_name, crest_url), away:mundial_slots!mundial_matches_away_slot_id_fkey(id, team_name, crest_url)',
        )
        .eq('mundial_id', mundialId!)
        .order('round', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useInvalidateMundials() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['mundials'] })
}

export function useInvalidateMundial(mundialId: string | undefined) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['mundial', mundialId] })
    queryClient.invalidateQueries({ queryKey: ['mundial-slots', mundialId] })
    queryClient.invalidateQueries({ queryKey: ['mundial-eligible', mundialId] })
    queryClient.invalidateQueries({ queryKey: ['mundial-matches', mundialId] })
  }
}
