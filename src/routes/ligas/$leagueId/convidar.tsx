import { createFileRoute } from '@tanstack/react-router'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { useLeague, useMyMembership, useInvalidateLeague } from '#/hooks/use-leagues'
import { InvitePanel } from '#/components/leagues/invite-panel'
import { Skeleton } from '#/components/ui/skeleton'

export const Route = createFileRoute('/ligas/$leagueId/convidar')({ component: ConvidarPage })

function ConvidarPage() {
  return (
    <RequireAuth>
      <ConvidarContent />
    </RequireAuth>
  )
}

function ConvidarContent() {
  const { leagueId } = Route.useParams()
  const { data: league, isLoading } = useLeague(leagueId)
  const { data: membership } = useMyMembership(leagueId)
  const invalidate = useInvalidateLeague(leagueId)

  const isAdmin = membership?.role === 'owner' || membership?.role === 'admin'

  return (
    <div className="mx-auto min-h-screen max-w-md pb-10">
      <AppHeader title="Convidar" backTo={`/ligas/${leagueId}`} />
      <div className="px-4 py-6">
        {isLoading || !league ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <InvitePanel league={league} isAdmin={isAdmin} onChanged={invalidate} />
        )}
      </div>
    </div>
  )
}
