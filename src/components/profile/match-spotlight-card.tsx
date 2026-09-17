import { Link } from '@tanstack/react-router'
import { Swords } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import type { Database } from '#/lib/supabase/types'

type NextMatch = Database['public']['Functions']['player_next_match']['Returns'][number]

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Aguardando resultado',
  pending_confirmation: 'Aguardando confirmação',
}

export function MatchSpotlightCard({ match }: { match: NextMatch }) {
  return (
    <Link
      to="/edicoes/$editionId"
      params={{ editionId: match.edition_id }}
      className="grid gap-3 rounded-xl border border-primary/30 bg-card p-4 transition-colors hover:border-primary/60"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {match.league_name} · {match.competition_name}
        </p>
        <Badge variant={match.status === 'pending_confirmation' ? 'warning' : 'outline'}>
          {STATUS_LABEL[match.status] ?? match.status}
        </Badge>
      </div>

      <div className="flex items-center justify-center gap-4">
        <p className="min-w-0 flex-1 truncate text-right font-display text-base">{match.team_name}</p>
        <Swords className="size-5 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 truncate font-display text-base">{match.opponent_team_name}</p>
      </div>

      <p className="text-center text-xs text-muted-foreground">Rodada {match.round}</p>
    </Link>
  )
}
