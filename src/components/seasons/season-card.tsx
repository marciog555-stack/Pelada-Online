import { Link } from '@tanstack/react-router'
import { seasonStatus, SEASON_STATUS_LABELS, formatSeasonDateRange } from '#/lib/seasons/status'
import { Badge } from '#/components/ui/badge'
import type { Season } from '#/hooks/use-seasons'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  upcoming: 'secondary',
  ended: 'outline',
}

export function SeasonCard({ season }: { season: Season }) {
  const status = seasonStatus(season)
  return (
    <Link
      to="/temporadas/$seasonId"
      params={{ seasonId: season.id }}
      className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div className="min-w-0">
        <p className="truncate font-display text-lg leading-none">{season.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatSeasonDateRange(season.starts_at, season.ends_at)}
        </p>
      </div>
      <Badge variant={STATUS_VARIANT[status]}>{SEASON_STATUS_LABELS[status]}</Badge>
    </Link>
  )
}
