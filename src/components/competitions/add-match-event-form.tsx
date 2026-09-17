import { useState } from 'react'
import { Plus } from 'lucide-react'
import { addMatchEvent } from '#/lib/competitions/api'
import type { MatchEventInput } from '#/lib/competitions/api'
import { EVENT_TYPE_OPTIONS } from '#/lib/competitions/schemas'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Alert, AlertDescription } from '#/components/ui/alert'

type Side = { id: string; team_name: string }

// Pro admin completar a súmula depois - quem fez os gols/cartões é
// opcional na hora do lançamento, então dá pra faltar. Isso deixa
// preencher com a partida já confirmada.
export function AddMatchEventForm({
  matchId,
  home,
  away,
  onAdded,
}: {
  matchId: string
  home: Side
  away: Side
  onAdded: () => void
}) {
  const [open, setOpen] = useState(false)
  const [participantId, setParticipantId] = useState(home.id)
  const [eventType, setEventType] = useState<MatchEventInput['eventType']>('goal')
  const [athleteName, setAthleteName] = useState('')
  const [assistAthleteName, setAssistAthleteName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Adicionar gol/cartão
      </Button>
    )
  }

  async function handleSubmit() {
    if (!athleteName.trim()) {
      setError('Preencha o nome do atleta.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await addMatchEvent({
        matchId,
        participantId,
        eventType,
        athleteName: athleteName.trim(),
        assistAthleteName: assistAthleteName.trim() || undefined,
      })
      setAthleteName('')
      setAssistAthleteName('')
      setOpen(false)
      onAdded()
    } catch {
      setError('Não foi possível adicionar. Tente de novo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-2 rounded-lg border border-border p-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Select value={participantId} onValueChange={setParticipantId}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={home.id}>{home.team_name}</SelectItem>
          <SelectItem value={away.id}>{away.team_name}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={eventType} onValueChange={(v) => setEventType(v as MatchEventInput['eventType'])}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EVENT_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input placeholder="Nome do atleta" value={athleteName} onChange={(e) => setAthleteName(e.target.value)} />
      {eventType === 'goal' && (
        <Input
          placeholder="Assistência (opcional)"
          value={assistAthleteName}
          onChange={(e) => setAssistAthleteName(e.target.value)}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}
