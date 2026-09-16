import { Target } from 'lucide-react'
import { computeEditionScorers } from '#/lib/competitions/stats'
import type { MatchEvent } from '#/hooks/use-competitions'

type ParticipantInfo = { team_name: string; crest_url: string | null }

export function EditionScorersList({
  events,
  participants,
}: {
  events: MatchEvent[]
  participants: Map<string, ParticipantInfo>
}) {
  const scorers = computeEditionScorers(events)

  if (scorers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Artilharia aparece quando houver gols registrados.
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {scorers.map((row, index) => {
        const participant = participants.get(row.participantId)
        return (
          <div
            key={`${row.participantId}-${row.athleteName}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <span className="w-5 shrink-0 text-center text-xs text-muted-foreground tabular-nums">{index + 1}</span>
            {participant?.crest_url ? (
              <img src={participant.crest_url} alt="" className="size-6 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="size-6 shrink-0 rounded-full bg-secondary" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{row.athleteName}</p>
              <p className="truncate text-xs text-muted-foreground">{participant?.team_name ?? '—'}</p>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Target className="size-4" />
              <span className="font-display text-lg tabular-nums">{row.goals}</span>
            </div>
            {row.assists > 0 && <span className="text-xs text-muted-foreground">{row.assists} assist.</span>}
          </div>
        )
      })}
    </div>
  )
}
