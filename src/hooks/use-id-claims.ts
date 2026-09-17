import { useQuery } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase/client'
import { useAuth } from '#/lib/auth/auth-provider'

export function useOwnIdClaims() {
  const { user, status } = useAuth()

  return useQuery({
    queryKey: ['id-claims', 'me', user?.id],
    enabled: status === 'signed-in' && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('efootball_id_claims')
        .select('*')
        .eq('claimant_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
