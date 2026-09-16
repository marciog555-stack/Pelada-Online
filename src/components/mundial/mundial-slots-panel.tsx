import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { setSlotConfirmed, removeMundialSlot, drawMundialBracket } from '#/lib/mundial/api'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Alert, AlertDescription } from '#/components/ui/alert'
import type { Mundial, MundialSlot } from '#/hooks/use-mundial'

type SlotWithJoins = MundialSlot & {
  league: { id: string; name: string } | null
  profile: { id: string; display_name: string; efootball_id: string } | null
}

export function MundialSlotsPanel({
  mundial,
  slots,
  isAdmin,
  onChanged,
}: {
  mundial: Mundial
  slots: SlotWithJoins[]
  isAdmin: boolean
  onChanged: () => void
}) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmed = slots.filter((s) => s.confirmed)

  async function toggleConfirmed(slot: SlotWithJoins) {
    setBusyId(slot.id)
    try {
      await setSlotConfirmed(slot.id, !slot.confirmed)
      onChanged()
    } catch {
      setError('Vagas esgotadas ou não foi possível confirmar. Tente de novo.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleRemove(slot: SlotWithJoins) {
    setBusyId(slot.id)
    try {
      await removeMundialSlot(slot.id)
      onChanged()
    } finally {
      setBusyId(null)
    }
  }

  async function handleDraw() {
    setDrawing(true)
    setError(null)
    try {
      await drawMundialBracket(
        mundial.id,
        confirmed.map((s) => s.id),
      )
      onChanged()
    } catch {
      setError('Não foi possível sortear a chave. Tente de novo.')
    } finally {
      setDrawing(false)
    }
  }

  return (
    <div className="grid gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {slots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhuma vaga adicionada ainda.
        </div>
      ) : (
        <div className="grid gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Vagas ({confirmed.length}/{slots.length} confirmadas{mundial.max_slots ? ` de ${mundial.max_slots}` : ''})
          </p>
          {slots.map((slot) => (
            <div key={slot.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              {slot.crest_url ? (
                <img src={slot.crest_url} alt="" className="size-8 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="size-8 shrink-0 rounded-full bg-secondary" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{slot.team_name}</p>
                <p className="truncate text-xs text-muted-foreground">{slot.league?.name}</p>
              </div>
              <Badge variant={slot.confirmed ? 'default' : 'outline'}>
                {slot.confirmed ? 'Confirmada' : 'Pendente'}
              </Badge>
              {isAdmin && mundial.status === 'open' && (
                <>
                  <Button
                    size="icon"
                    variant={slot.confirmed ? 'outline' : 'secondary'}
                    disabled={busyId === slot.id}
                    onClick={() => toggleConfirmed(slot)}
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" disabled={busyId === slot.id} onClick={() => handleRemove(slot)}>
                    <Trash2 className="size-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && mundial.status === 'open' && (
        <Button onClick={handleDraw} disabled={drawing || confirmed.length < 2}>
          {drawing ? 'Sorteando…' : `Sortear chave e começar (${confirmed.length} confirmados)`}
        </Button>
      )}
      {isAdmin && mundial.status === 'open' && confirmed.length < 2 && (
        <p className="text-center text-xs text-muted-foreground">Precisa de pelo menos 2 vagas confirmadas.</p>
      )}
    </div>
  )
}
