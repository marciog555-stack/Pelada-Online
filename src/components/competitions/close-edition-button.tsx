import { useState } from 'react'
import { closeEdition } from '#/lib/competitions/api'
import { buildEditionClosure } from '#/lib/competitions/stats'
import type { Preset } from '#/lib/competition-engine/types'
import type { Match, MatchEvent } from '#/hooks/use-competitions'
import { Button } from '#/components/ui/button'
import { Alert, AlertDescription } from '#/components/ui/alert'

export function CloseEditionButton({
  editionId,
  isKnockout,
  participantIds,
  matches,
  events,
  preset,
  onClosed,
}: {
  editionId: string
  isKnockout: boolean
  participantIds: string[]
  matches: Match[]
  events: MatchEvent[]
  preset: Preset
  onClosed: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eligible = isEditionReadyToClose(isKnockout, matches)
  if (!eligible) return null

  async function handleClose() {
    setBusy(true)
    setError(null)
    try {
      const { finalPositions, awards } = buildEditionClosure(isKnockout, participantIds, matches, events, preset)
      await closeEdition(editionId, finalPositions, awards)
      onClosed()
    } catch {
      setError('Não foi possível encerrar a edição. Tente de novo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={handleClose} disabled={busy}>
        {busy ? 'Encerrando…' : 'Encerrar edição e distribuir premiações'}
      </Button>
    </div>
  )
}

function isEditionReadyToClose(isKnockout: boolean, matches: Match[]): boolean {
  if (matches.length === 0) return false
  const allDone = matches.every((m) => m.status === 'confirmed' || m.status === 'wo')
  if (!allDone) return false
  if (!isKnockout) return true

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b)
  const lastRound = rounds[rounds.length - 1]
  return matches.filter((m) => m.round === lastRound).length === 1
}
