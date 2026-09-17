import { Goal, Shield, ChartNoAxesCombined } from 'lucide-react'
import type { RankedStandingRow } from '#/lib/competition-engine'

type ParticipantInfo = { team_name: string }

export function EditionHighlights({
  rows,
  participants,
}: {
  rows: RankedStandingRow[]
  participants: Map<string, ParticipantInfo>
}) {
  const played = rows.filter((row) => row.played > 0)
  if (played.length === 0) return null

  const bestAttack = played.reduce((a, b) => (b.goalsFor > a.goalsFor ? b : a))
  const bestDefense = played.reduce((a, b) => (b.goalsAgainst < a.goalsAgainst ? b : a))
  const totalGoals = played.reduce((sum, row) => sum + row.goalsFor, 0)
  const totalMatches = played.reduce((sum, row) => sum + row.played, 0) / 2
  const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0.0'

  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium text-muted-foreground">Destaques</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="grid gap-2 rounded-xl border border-border bg-card p-3">
          <Goal className="size-4 text-success" />
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Melhor ataque</p>
            <p className="font-display text-lg leading-none">{bestAttack.goalsFor} gols</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {participants.get(bestAttack.participantId)?.team_name ?? '—'}
            </p>
          </div>
        </div>
        <div className="grid gap-2 rounded-xl border border-border bg-card p-3">
          <Shield className="size-4 text-primary" />
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Melhor defesa</p>
            <p className="font-display text-lg leading-none">{bestDefense.goalsAgainst} sofridos</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {participants.get(bestDefense.participantId)?.team_name ?? '—'}
            </p>
          </div>
        </div>
        <div className="grid gap-2 rounded-xl border border-border bg-card p-3">
          <ChartNoAxesCombined className="size-4 text-gold" />
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Média/jogo</p>
            <p className="font-display text-lg leading-none">{avgGoals}</p>
            <p className="mt-1 text-xs text-muted-foreground">{Math.round(totalMatches)} jogos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
