import { Link } from '@tanstack/react-router'
import { Swords, Trophy } from 'lucide-react'
import { PRESET_OPTIONS } from '#/lib/competitions/schemas'
import { PRESET_THEMES } from '#/lib/competitions/preset-theme'
import type { Competition } from '#/hooks/use-competitions'

const PRESET_LABELS: Record<string, string> = Object.fromEntries(
  PRESET_OPTIONS.map((option) => [option.value, option.label]),
)

export function CompetitionCard({ competition }: { competition: Competition }) {
  const Icon = competition.preset_id === 'mata-mata-simples' ? Trophy : Swords
  const theme = PRESET_THEMES[competition.preset_id]
  return (
    <Link
      to="/campeonatos/$competitionId"
      params={{ competitionId: competition.id }}
      className="flex items-center gap-3 rounded-xl border border-l-4 border-border bg-card p-4 transition-colors hover:border-primary/50"
      style={theme ? { borderLeftColor: theme.primary } : undefined}
    >
      <Icon className="size-5 text-primary" style={theme ? { color: theme.primary } : undefined} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg leading-none">{competition.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{PRESET_LABELS[competition.preset_id]}</p>
      </div>
    </Link>
  )
}
