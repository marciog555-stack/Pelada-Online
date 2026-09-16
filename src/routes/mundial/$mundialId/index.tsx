import { createFileRoute } from '@tanstack/react-router'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { BottomNav } from '#/components/layout/bottom-nav'
import {
  useMundial,
  useMundialSlots,
  useMundialEligibleChampions,
  useMundialMatches,
  useInvalidateMundial,
} from '#/hooks/use-mundial'
import { useIsPlatformAdmin } from '#/hooks/use-seasons'
import { EligibleChampionsList } from '#/components/mundial/eligible-champions-list'
import { MundialSlotsPanel } from '#/components/mundial/mundial-slots-panel'
import { MundialBracket } from '#/components/mundial/mundial-bracket'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'

const STATUS_LABELS: Record<string, string> = {
  open: 'Vagas abertas',
  in_progress: 'Em andamento',
  completed: 'Encerrado',
}

export const Route = createFileRoute('/mundial/$mundialId/')({ component: MundialPage })

function MundialPage() {
  return (
    <RequireAuth>
      <MundialContent />
    </RequireAuth>
  )
}

function MundialContent() {
  const { mundialId } = Route.useParams()
  const { data: mundial, isLoading: loadingMundial } = useMundial(mundialId)
  const { data: slots, isLoading: loadingSlots } = useMundialSlots(mundialId)
  const { data: eligible, isLoading: loadingEligible } = useMundialEligibleChampions(mundialId)
  const { data: matches, isLoading: loadingMatches } = useMundialMatches(mundialId)
  const { data: isAdmin } = useIsPlatformAdmin()
  const invalidate = useInvalidateMundial(mundialId)

  if (loadingMundial || !mundial) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <AppHeader title={mundial.name} backTo="/mundial" />
      <div className="grid gap-4 px-4 py-6">
        <Badge variant="outline" className="justify-self-start">
          {STATUS_LABELS[mundial.status]}
        </Badge>

        {mundial.status === 'open' ? (
          <>
            {loadingEligible || !eligible ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : (
              <EligibleChampionsList
                mundialId={mundialId}
                rows={eligible}
                isAdmin={!!isAdmin}
                onChanged={invalidate}
              />
            )}

            {loadingSlots || !slots ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : (
              <MundialSlotsPanel mundial={mundial} slots={slots} isAdmin={!!isAdmin} onChanged={invalidate} />
            )}
          </>
        ) : loadingMatches || !matches ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : (
          <MundialBracket mundial={mundial} matches={matches} isAdmin={!!isAdmin} onChanged={invalidate} />
        )}
      </div>
      <BottomNav />
    </div>
  )
}
