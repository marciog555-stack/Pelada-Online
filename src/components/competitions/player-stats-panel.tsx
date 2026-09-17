import { EmptyState } from '#/components/ui/empty-state'
import { computeParticipantStats } from '#/lib/competitions/stats'
import type { Match } from '#/hooks/use-competitions'

type ParticipantInfo = { id: string; team_name: string; crest_url: string | null }

export function PlayerStatsPanel({
  participants,
  matches,
}: {
  participants: ParticipantInfo[]
  matches: Match[]
}) {
  const stats = participants
    .map((p) => ({ participant: p, stats: computeParticipantStats(p.id, matches) }))
    .filter(({ stats: s }) => s.played > 0)
    .sort((a, b) => b.stats.goalDifference - a.stats.goalDifference)

  if (stats.length === 0) {
    return <EmptyState>Estatísticas aparecem quando houver partidas confirmadas.</EmptyState>
  }

  return (
    <div className="grid gap-3">
      {stats.map(({ participant, stats: s }) => (
        <div key={participant.id} className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center gap-2">
            {participant.crest_url ? (
              <img src={participant.crest_url} alt="" className="size-6 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="size-6 shrink-0 rounded-full bg-secondary" />
            )}
            <p className="truncate font-display text-base">{participant.team_name}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <Stat label="Jogos" value={s.played} />
            <Stat label="Vitórias" value={s.wins} />
            <Stat label="Aproveit." value={`${s.winRate.toFixed(0)}%`} />
            <Stat label="Gols pró" value={s.goalsFor} />
            <Stat label="Gols contra" value={s.goalsAgainst} />
            <Stat label="Saldo" value={s.goalDifference} />
            <Stat label="Sem sofrer gol" value={s.cleanSheets} />
            <Stat label="Maior goleada" value={s.biggestWinMargin} />
            <Stat label="Seq. vitórias" value={s.currentWinStreak} />
            {(s.woInFavor > 0 || s.woAgainst > 0) && (
              <>
                <Stat label="W.O. a favor" value={s.woInFavor} />
                <Stat label="W.O. sofrido" value={s.woAgainst} />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-secondary/50 px-2 py-1.5">
      <p className="font-display text-lg leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
