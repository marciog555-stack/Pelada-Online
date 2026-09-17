import { useState } from 'react'
import { advanceKnockoutRound, advanceSwissRound } from '#/lib/competitions/api'
import type { Preset } from '#/lib/competition-engine/types'
import { MatchCard } from '#/components/competitions/match-card'
import { Button } from '#/components/ui/button'
import { Alert, AlertDescription } from '#/components/ui/alert'

interface MatchWithSides {
  id: string
  round: number
  status: string
  home_goals: number | null
  away_goals: number | null
  wo_winner_participant_id: string | null
  home: { id: string; team_name: string; crest_url: string | null } | null
  away: { id: string; team_name: string; crest_url: string | null } | null
}

function championName(match: MatchWithSides): string | undefined {
  if (!match.home) return match.away?.team_name
  if (!match.away) return match.home.team_name
  if (match.status === 'wo') {
    return match.wo_winner_participant_id === match.home.id ? match.home.team_name : match.away.team_name
  }
  return (match.home_goals ?? 0) > (match.away_goals ?? 0) ? match.home.team_name : match.away.team_name
}

export function MatchList({
  matches,
  preset,
  isAdmin,
  editionId,
  roundDeadlineDays,
  onChanged,
}: {
  matches: MatchWithSides[]
  preset: Preset
  isAdmin: boolean
  editionId: string
  roundDeadlineDays: number
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)

  const stage = preset.stages[0]
  const isKnockout = stage.kind === 'knockout'
  const isSwiss = stage.kind === 'swiss'

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b)
  const lastRound = rounds[rounds.length - 1]
  const lastRoundMatches = matches.filter((m) => m.round === lastRound)
  const lastRoundDone = lastRoundMatches.every((m) => m.status === 'confirmed' || m.status === 'wo')
  const champion = isKnockout && lastRoundMatches.length === 1 && lastRoundDone ? lastRoundMatches[0] : null

  const swissRoundsTotal = stage.kind === 'swiss' ? stage.rounds : null
  const swissFinished = swissRoundsTotal !== null && lastRound >= swissRoundsTotal

  const canAdvance = (isKnockout || isSwiss) && isAdmin && lastRoundDone && !champion && !swissFinished && !finished

  async function handleAdvance() {
    setBusy(true)
    setError(null)
    try {
      const result = isKnockout
        ? await advanceKnockoutRound(editionId, roundDeadlineDays)
        : await advanceSwissRound(editionId, roundDeadlineDays, preset)
      if (result.finished) setFinished(true)
      onChanged()
    } catch {
      setError('Ainda tem partida dessa rodada sem resultado confirmado.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {canAdvance && (
        <Button onClick={handleAdvance} disabled={busy} variant="secondary">
          {busy ? 'Gerando…' : 'Avançar para a próxima rodada'}
        </Button>
      )}

      {champion && (
        <Alert>
          <AlertDescription>🏆 {championName(champion)} é o campeão!</AlertDescription>
        </Alert>
      )}

      {rounds.map((round) => (
        <div key={round} className="grid gap-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs tracking-wide text-muted-foreground">RODADA {round}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-2">
            {matches
              .filter((m) => m.round === round)
              .map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
