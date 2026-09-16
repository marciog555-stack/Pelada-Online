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
