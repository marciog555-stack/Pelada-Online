import { useState } from 'react'
import { resolveCrestChange } from '#/lib/competitions/api'
import { Button } from '#/components/ui/button'

interface CrestRequestWithParticipant {
  id: string
  requested_crest_url: string
  participant: { id: string; team_name: string }
}

export function CrestChangeRequestsPanel({
  requests,
  adminId,
  onChanged,
}: {
  requests: CrestRequestWithParticipant[]
  adminId: string
  onChanged: () => void
}) {
  const [busyId, setBusyId] = useState<string | null>(null)

  if (requests.length === 0) return null

  async function resolve(id: string, status: 'approved' | 'rejected') {
    setBusyId(id)
    try {
      await resolveCrestChange(id, status, adminId)
      onChanged()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium text-muted-foreground">Pedidos de troca de escudo</p>
      {requests.map((request) => (
        <div key={request.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
          <img
            src={request.requested_crest_url}
            alt={request.participant.team_name}
            className="size-10 shrink-0 rounded-full object-cover"
          />
          <p className="flex-1 truncate text-sm">{request.participant.team_name}</p>
          <Button size="sm" disabled={busyId === request.id} onClick={() => resolve(request.id, 'approved')}>
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busyId === request.id}
            onClick={() => resolve(request.id, 'rejected')}
          >
            Recusar
          </Button>
        </div>
      ))}
    </div>
  )
}
