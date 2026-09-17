import { Target } from 'lucide-react'
import { EmptyState } from '#/components/ui/empty-state'
import type { Database } from '#/lib/supabase/types'

type TopScorerRow = Database['public']['Functions']['league_top_scorers']['Returns'][number]

export function LeagueTopScorersPanel({ rows }: { rows: TopScorerRow[] }) {
  if (rows.length === 0) {
    return <EmptyState>Artilheiros: aparece quando houver gols registrados.</EmptyState>
  }

  return (
    <div className="grid gap-2">
      {rows.map((row, index) => (
        <div
          key={`${row.user_id}-${row.athlete_name}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
        >
          <span className="w-5 shrink-0 text-center text-xs text-muted-foreground tabular-nums">{index + 1}</span>
          {row.avatar_url ? (
            <img src={row.avatar_url} alt="" className="size-6 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="size-6 shrink-0 rounded-full bg-secondary" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{row.athlete_name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.display_name}</p>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Target className="size-4" />
            <span className="font-display text-lg tabular-nums">{row.goals}</span>
          </div>
          {row.assists > 0 && <span className="text-xs text-muted-foreground">{row.assists} assist.</span>}
        </div>
      ))}
    </div>
  )
}
