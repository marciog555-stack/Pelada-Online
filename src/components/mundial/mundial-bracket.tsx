import { useState } from 'react'
import { useAuth } from '#/lib/auth/auth-provider'
import { setMundialMatchResult, applyMundialMatchWo, advanceMundialRound } from '#/lib/mundial/api'
import { TrophyCup } from '#/components/profile/trophy-cup'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import { Alert, AlertDescription } from '#/components/ui/alert'
import type { Mundial } from '#/hooks/use-mundial'

type Side = { id: string; team_name: string; crest_url: string | null } | null

interface MundialMatchWithSides {
  id: string
  round: number
  status: string
  home_goals: number | null
  away_goals: number | null
  wo_winner_slot_id: string | null
  home: Side
  away: Side
}

function winnerName(match: MundialMatchWithSides): string | undefined {
  if (!match.home) return match.away?.team_name
  if (!match.away) return match.home.team_name
  if (match.wo_winner_slot_id) {
    return match.wo_winner_slot_id === match.home.id ? match.home.team_name : match.away.team_name
  }
  return (match.home_goals ?? 0) > (match.away_goals ?? 0) ? match.home.team_name : match.away.team_name
}

export function MundialBracket({
  mundial,
  matches,
  isAdmin,
  onChanged,
}: {
  mundial: Mundial
  matches: MundialMatchWithSides[]
  isAdmin: boolean
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b)
  const lastRound = rounds[rounds.length - 1]
  const lastRoundMatches = matches.filter((m) => m.round === lastRound)
  const lastRoundDone = lastRoundMatches.every((m) => m.status === 'confirmed')
  const champion = lastRoundMatches.length === 1 && lastRoundDone ? lastRoundMatches[0] : null

  async function handleAdvance() {
    setBusy(true)
    setError(null)
    try {
      await advanceMundialRound(mundial.id)
      onChanged()
    } catch {
      setError('Ainda tem partida dessa rodada sem resultado.')
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

      {mundial.status === 'in_progress' && isAdmin && lastRoundDone && (
        <Button onClick={handleAdvance} disabled={busy} variant="secondary">
          {busy ? 'Gerando…' : champion ? 'Confirmar campeão e encerrar' : 'Avançar para a próxima rodada'}
        </Button>
      )}

      {champion && (
        <div className="grid justify-items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 p-6 text-center">
          <TrophyCup size={56} earned />
          <p className="font-display text-2xl">{winnerName(champion)}</p>
          <p className="text-sm text-muted-foreground">é o campeão do Mundial</p>
        </div>
      )}

      {rounds.map((round) => (
        <div key={round} className="grid gap-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs tracking-wide text-muted-foreground">
              {round === lastRound && lastRoundMatches.length === 1 ? 'FINAL' : `RODADA ${round}`}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-2">
            {matches
              .filter((m) => m.round === round)
              .map((match) => (
                <MundialMatchRow key={match.id} match={match} isAdmin={isAdmin} onChanged={onChanged} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MundialMatchRow({
  match,
  isAdmin,
  onChanged,
}: {
  match: MundialMatchWithSides
  isAdmin: boolean
  onChanged: () => void
}) {
  const { user } = useAuth()
  const [homeGoals, setHomeGoals] = useState(0)
  const [awayGoals, setAwayGoals] = useState(0)
  const [busy, setBusy] = useState(false)

  const hasScore = match.home_goals !== null && match.away_goals !== null
  const canReport = isAdmin && match.status === 'scheduled' && match.home && match.away

  async function handleSubmit() {
    if (!user) return
    setBusy(true)
    try {
      await setMundialMatchResult(match.id, homeGoals, awayGoals, user.id)
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  async function handleWo(winnerId: string) {
    if (!user) return
    setBusy(true)
    try {
      await applyMundialMatchWo(match.id, winnerId, user.id)
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-2 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <TeamLabel side={match.home} />
        <p className="font-display text-lg tabular-nums">
          {hasScore ? `${match.home_goals} - ${match.away_goals}` : 'vs'}
        </p>
        <TeamLabel side={match.away} align="right" />
      </div>
      <Badge
        variant={match.status === 'confirmed' ? 'success' : 'outline'}
        className="justify-self-center"
      >
        {match.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
      </Badge>

      {canReport && (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-1">
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            value={homeGoals}
            onChange={(e) => setHomeGoals(e.target.valueAsNumber || 0)}
          />
          <span className="text-sm text-muted-foreground">x</span>
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            value={awayGoals}
            onChange={(e) => setAwayGoals(e.target.valueAsNumber || 0)}
          />
          <Button size="sm" className="col-span-3" disabled={busy} onClick={handleSubmit}>
            Lançar resultado
          </Button>
          <div className="col-span-3 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" disabled={busy} onClick={() => handleWo(match.home!.id)}>
              W.O. {match.home!.team_name}
            </Button>
            <Button size="sm" variant="outline" className="flex-1" disabled={busy} onClick={() => handleWo(match.away!.id)}>
              W.O. {match.away!.team_name}
            </Button>
          </div>
        </div>
      )}
    </div>
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
