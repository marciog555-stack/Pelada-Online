import { Badge } from '#/components/ui/badge'
import { useOwnIdClaims } from '#/hooks/use-id-claims'

const STATUS_LABELS: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' }> = {
  pending: { label: 'Em análise', variant: 'secondary' },
  approved: { label: 'Aprovada', variant: 'default' },
  rejected: { label: 'Recusada', variant: 'destructive' },
}

export function IdClaimsList() {
  const { data: claims, isLoading } = useOwnIdClaims()

  if (isLoading) return null
  if (!claims || claims.length === 0) return null

  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium text-muted-foreground">Suas contestações de ID</p>
      {claims.map((claim) => {
        const status = STATUS_LABELS[claim.status] ?? STATUS_LABELS.pending
        return (
          <div
            key={claim.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
          >
            <span className="text-sm">@{claim.efootball_id}</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        )
      })}
    </div>
  )
}
