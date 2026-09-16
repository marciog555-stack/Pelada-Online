import { Link } from '@tanstack/react-router'
import { Badge } from '#/components/ui/badge'

type Side = { id: string; team_name: string; crest_url: string | null } | null

const STATUS_LABELS: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' | 'outline' }> = {
  scheduled: { label: 'Agendado', variant: 'outline' },
  pending_confirmation: { label: 'Aguardando confirmação', variant: 'secondary' },
  contested: { label: 'Contestado', variant: 'destructive' },
  confirmed: { label: 'Confirmado', variant: 'default' },
  wo: { label: 'W.O.', variant: 'destructive' },
}

export function MatchCard({
  match,
}: {
  match: {
    id: string
    status: string
    home_goals: number | null
    away_goals: number | null
    home: Side
    away: Side
  }
}) {
  const status = STATUS_LABELS[match.status] ?? STATUS_LABELS.scheduled
  const hasScore = match.home_goals !== null && match.away_goals !== null

  return (
    <Link
      to="/partidas/$matchId"
      params={{ matchId: match.id }}
      className="grid gap-2 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
    >
      <div className="flex items-center justify-between gap-2">
        <TeamLabel side={match.home} />
        <p className="font-display text-lg tabular-nums">
          {hasScore ? `${match.home_goals} - ${match.away_goals}` : 'vs'}
        </p>
        <TeamLabel side={match.away} align="right" />
      </div>
      <Badge variant={status.variant} className="justify-self-center">
        {status.label}
      </Badge>
    </Link>
  )
}

function TeamLabel({ side, align = 'left' }: { side: Side; align?: 'left' | 'right' }) {
  if (!side) {
    return <p className="flex-1 text-sm text-muted-foreground">Folga</p>
  }
  return (
    <div className={`flex flex-1 items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      {side.crest_url ? (
        <img src={side.crest_url} alt={side.team_name} className="size-6 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="size-6 shrink-0 rounded-full bg-secondary" />
      )}
      <p className="truncate text-sm">{side.team_name}</p>
    </div>
  )
}
