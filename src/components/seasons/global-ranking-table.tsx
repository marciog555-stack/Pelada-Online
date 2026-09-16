import { Link } from '@tanstack/react-router'
import { Trophy } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { initials } from '#/lib/text'
import type { Database } from '#/lib/supabase/types'

type RankingRow = Database['public']['Functions']['global_season_ranking']['Returns'][number]

export function GlobalRankingTable({ rows }: { rows: RankingRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        O ranking aparece aqui quando houver edições encerradas dentro do período da temporada.
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {rows.map((row, index) => (
        <Link
          key={row.user_id}
          to="/jogador/$efootballId"
          params={{ efootballId: row.efootball_id }}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
        >
          <span className="w-6 shrink-0 text-center text-sm text-muted-foreground tabular-nums">{index + 1}</span>
          <Avatar>
            {row.avatar_url && <AvatarImage src={row.avatar_url} alt={row.display_name} />}
            <AvatarFallback>{initials(row.display_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{row.display_name}</p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              {row.editions_played} {row.editions_played === 1 ? 'edição' : 'edições'}
              {row.titles > 0 && (
                <span className="inline-flex items-center gap-1 text-primary">
                  <Trophy className="size-3" /> {row.titles}
                </span>
              )}
            </p>
          </div>
          <span className="font-display text-lg tabular-nums text-primary">{row.points}</span>
        </Link>
      ))}
    </div>
  )
}
