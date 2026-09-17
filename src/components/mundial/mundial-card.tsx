import { Link } from '@tanstack/react-router'
import { Globe } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import type { Mundial } from '#/hooks/use-mundial'

const STATUS_LABELS: Record<string, { label: string; variant: 'secondary' | 'default' | 'outline' }> = {
  open: { label: 'Vagas abertas', variant: 'secondary' },
  in_progress: { label: 'Em andamento', variant: 'default' },
  completed: { label: 'Encerrado', variant: 'outline' },
}

type MundialWithSeason = Mundial & { season: { id: string; name: string } | null }

export function MundialCard({ mundial }: { mundial: MundialWithSeason }) {
  const status = STATUS_LABELS[mundial.status] ?? STATUS_LABELS.open
  return (
    <Link
      to="/mundial/$mundialId"
      params={{ mundialId: mundial.id }}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <Globe className="size-5 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg leading-none">{mundial.name}</p>
        {mundial.season && <p className="mt-1 text-xs text-muted-foreground">{mundial.season.name}</p>}
      </div>
      <Badge variant={status.variant}>{status.label}</Badge>
    </Link>
  )
}
