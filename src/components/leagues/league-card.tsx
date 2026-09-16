import { Link } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import type { League } from '#/hooks/use-leagues'

export function LeagueCard({ league, status }: { league: League; status: string }) {
  return (
    <Link
      to="/ligas/$leagueId"
      params={{ leagueId: league.id }}
      className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div>
        <p className="font-display text-lg leading-none">{league.name}</p>
        {league.description && (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{league.description}</p>
        )}
      </div>
      {status === 'pending' ? (
        <Badge variant="secondary">Aguardando aprovação</Badge>
      ) : (
        <Users className="size-4 text-muted-foreground" />
      )}
    </Link>
  )
}
