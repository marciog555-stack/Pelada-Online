import { Link } from '@tanstack/react-router'
import { Trophy } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '#/components/ui/card'
import type { Database } from '#/lib/supabase/types'

type HistoryRow = Database['public']['Functions']['player_career_history']['Returns'][number]

export function CareerHistoryList({ history }: { history: HistoryRow[] | undefined }) {
  if (!history || history.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Histórico</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {history.map((row) => (
          <Link
            key={row.edition_id}
            to="/edicoes/$editionId"
            params={{ editionId: row.edition_id }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
          >
            {row.crest_url ? (
              <img src={row.crest_url} alt="" className="size-8 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                {row.final_position}º
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {row.competition_name} · Edição {row.edition_number}
              </p>
              <p className="truncate text-xs text-muted-foreground">{row.league_name}</p>
            </div>
            <div className="shrink-0 text-right">
              {row.is_champion ? (
                <Trophy className="ml-auto size-4 text-gold" />
              ) : (
                <p className="text-xs tabular-nums text-muted-foreground">
                  {row.final_position}º de {row.participant_count}
                </p>
              )}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
