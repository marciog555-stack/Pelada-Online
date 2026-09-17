import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, ShieldPlus, Trash2 } from 'lucide-react'
import { removeParticipant, startEdition, updateParticipant, requestCrestChange } from '#/lib/competitions/api'
import { uploadCrest } from '#/lib/storage'
import { Button } from '#/components/ui/button'
import { Alert, AlertDescription } from '#/components/ui/alert'
import type { Edition, EditionParticipant } from '#/hooks/use-competitions'

type ParticipantWithProfile = EditionParticipant & {
  profile: { id: string; efootball_id: string; display_name: string; avatar_url: string | null }
}

export function EditionParticipantsPanel({
  edition,
  participants,
  presetId,
  currentUserId,
  isAdmin,
  onChanged,
}: {
  edition: Edition
  participants: ParticipantWithProfile[]
  presetId: string
  currentUserId: string | undefined
  isAdmin: boolean
  onChanged: () => void
}) {
  const navigate = useNavigate()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadingForId = useRef<string | null>(null)

  const isUpcoming = edition.status === 'upcoming'
  const mine = participants.find((p) => p.user_id === currentUserId)

  async function handleRemove(id: string) {
    setBusyId(id)
    try {
      await removeParticipant(id)
      onChanged()
    } finally {
      setBusyId(null)
    }
  }

  function triggerCrestUpload(participantId: string) {
    uploadingForId.current = participantId
    fileInputRef.current?.click()
  }

  async function handleCrestFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    const participantId = uploadingForId.current
    event.target.value = ''
    if (!file || !participantId || !currentUserId) return

    setBusyId(participantId)
    setError(null)
    try {
      const url = await uploadCrest(currentUserId, file)
      if (isUpcoming) {
        await updateParticipant(participantId, { crestUrl: url })
      } else {
        await requestCrestChange(participantId, url)
      }
      onChanged()
    } catch {
      setError('Não foi possível enviar o escudo. Tente de novo.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleStart() {
    setStarting(true)
    setError(null)
    try {
      await startEdition(
        { id: edition.id, roundDeadlineDays: edition.round_deadline_days },
        presetId,
        participants.map((p) => p.id),
      )
      onChanged()
      navigate({ to: '/edicoes/$editionId', params: { editionId: edition.id } })
    } catch {
      setError('Não foi possível iniciar a edição. Tente de novo.')
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleCrestFile} />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        <p className="text-sm font-medium text-muted-foreground">Participantes ({participants.length})</p>
        {participants.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <button
              type="button"
              onClick={() => (p.user_id === currentUserId || isAdmin) && triggerCrestUpload(p.id)}
              className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary"
              style={{ borderColor: p.primary_color }}
            >
              {busyId === p.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : p.crest_url ? (
                <img src={p.crest_url} alt={p.team_name} className="size-full object-cover" />
              ) : (
                <ShieldPlus className="size-4 text-muted-foreground" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.team_name}</p>
              <p className="truncate text-xs text-muted-foreground">@{p.profile.efootball_id}</p>
            </div>
            {isAdmin && isUpcoming && (
              <Button size="icon" variant="ghost" disabled={busyId === p.id} onClick={() => handleRemove(p.id)}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {!isUpcoming && mine && (
        <p className="text-xs text-muted-foreground">
          A edição já começou: trocar de escudo agora abre um pedido pro admin aprovar.
        </p>
      )}

      {isAdmin && isUpcoming && (
        <Button onClick={handleStart} disabled={starting || participants.length < 2}>
          {starting ? 'Iniciando…' : `Iniciar edição (${participants.length} participantes)`}
        </Button>
      )}
      {isAdmin && isUpcoming && participants.length < 2 && (
        <p className="text-center text-xs text-muted-foreground">Precisa de pelo menos 2 participantes pra iniciar.</p>
      )}
    </div>
  )
}
