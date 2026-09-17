import { Link } from '@tanstack/react-router'
import { Globe } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import type { Mundial } from '#/hooks/use-mundial'

export const MUNDIAL_STATUS_META: Record<string, { label: string; variant: 'outline' | 'success' | 'gold' }> = {
  open: { label: 'Vagas abertas', variant: 'outline' },
  in_progress: { label: 'Em andamento', variant: 'success' },
  completed: { label: 'Encerrado', variant: 'gold' },
}

type MundialWithSeason = Mundial & { season: { id: string; name: string } | null }

export function MundialCard({ mundial }: { mundial: MundialWithSeason }) {
  const status = MUNDIAL_STATUS_META[mundial.status] ?? MUNDIAL_STATUS_META.open
  return (
    <Link
      to="/mundial/$mundialId"
      params={{ mundialId: mundial.id }}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-gold/50"
    >
      <Globe className="size-5 text-gold" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg leading-none">{mundial.name}</p>
        {mundial.season && <p className="mt-1 text-xs text-muted-foreground">{mundial.season.name}</p>}
      </div>
      <Badge variant={status.variant}>{status.label}</Badge>
    </Link>
  )
}
