import { Link } from '@tanstack/react-router'
import { Badge } from '#/components/ui/badge'
import type { Edition } from '#/hooks/use-competitions'

const STATUS_LABELS: Record<string, { label: string; variant: 'secondary' | 'default' | 'outline' }> = {
  upcoming: { label: 'A começar', variant: 'secondary' },
  in_progress: { label: 'Em andamento', variant: 'default' },
  completed: { label: 'Encerrada', variant: 'outline' },
}

export function EditionCard({ edition }: { edition: Edition }) {
  const status = STATUS_LABELS[edition.status] ?? STATUS_LABELS.upcoming
  return (
    <Link
      to="/edicoes/$editionId"
      params={{ editionId: edition.id }}
      className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <p className="font-display text-lg leading-none">Edição {edition.number}</p>
      <Badge variant={status.variant}>{status.label}</Badge>
    </Link>
  )
}
