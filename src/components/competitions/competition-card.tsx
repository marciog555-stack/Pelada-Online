import { Link } from '@tanstack/react-router'
import { Swords, Trophy } from 'lucide-react'
import { PRESET_OPTIONS } from '#/lib/competitions/schemas'
import type { Competition } from '#/hooks/use-competitions'

const PRESET_LABELS: Record<string, string> = Object.fromEntries(
  PRESET_OPTIONS.map((option) => [option.value, option.label]),
)

export function CompetitionCard({ competition }: { competition: Competition }) {
  const Icon = competition.preset_id === 'mata-mata-simples' ? Trophy : Swords
  return (
    <Link
      to="/campeonatos/$competitionId"
      params={{ competitionId: competition.id }}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <Icon className="size-5 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg leading-none">{competition.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{PRESET_LABELS[competition.preset_id]}</p>
      </div>
    </Link>
  )
}
