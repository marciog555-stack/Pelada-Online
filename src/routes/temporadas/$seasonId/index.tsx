import { createFileRoute } from '@tanstack/react-router'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { BottomNav } from '#/components/layout/bottom-nav'
import { useSeason, useGlobalRanking } from '#/hooks/use-seasons'
import { seasonStatus, SEASON_STATUS_LABELS, formatSeasonDateRange } from '#/lib/seasons/status'
import { GlobalRankingTable } from '#/components/seasons/global-ranking-table'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'

export const Route = createFileRoute('/temporadas/$seasonId/')({ component: TemporadaPage })

function TemporadaPage() {
  return (
    <RequireAuth>
      <TemporadaContent />
    </RequireAuth>
  )
}

function TemporadaContent() {
  const { seasonId } = Route.useParams()
  const { data: season, isLoading: loadingSeason } = useSeason(seasonId)
  const { data: ranking, isLoading: loadingRanking } = useGlobalRanking(seasonId)

  if (loadingSeason || !season) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  const status = seasonStatus(season)

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <AppHeader title={season.name} backTo="/temporadas" />
      <div className="grid gap-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{formatSeasonDateRange(season.starts_at, season.ends_at)}</p>
          <Badge>{SEASON_STATUS_LABELS[status]}</Badge>
        </div>

        {loadingRanking || !ranking ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : (
          <GlobalRankingTable rows={ranking} />
        )}
      </div>
      <BottomNav />
    </div>
  )
}
