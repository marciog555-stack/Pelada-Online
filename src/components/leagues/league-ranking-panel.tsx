import type { Database } from '#/lib/supabase/types'

type PlayerStatsRow = Database['public']['Functions']['league_player_stats']['Returns'][number]

export function LeagueRankingPanel({ rows }: { rows: PlayerStatsRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Ranking interno: aparece quando houver partidas confirmadas.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="w-8 py-2 pl-3 text-left font-normal">#</th>
            <th className="py-2 text-left font-normal">Jogador</th>
            <th className="w-8 py-2 text-center font-normal">J</th>
            <th className="w-8 py-2 text-center font-normal">V</th>
            <th className="w-10 py-2 text-center font-normal">SG</th>
            <th className="w-10 py-2 pr-3 text-center font-normal">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.user_id} className="border-b border-border/60 last:border-0">
              <td className="py-2 pl-3 tabular-nums text-muted-foreground">{index + 1}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  {row.avatar_url ? (
                    <img src={row.avatar_url} alt="" className="size-5 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="size-5 shrink-0 rounded-full bg-secondary" />
                  )}
                  <span className="truncate">{row.display_name}</span>
                </div>
              </td>
              <td className="py-2 text-center tabular-nums">{row.played}</td>
              <td className="py-2 text-center tabular-nums">{row.wins}</td>
              <td className="py-2 text-center tabular-nums">{row.goals_for - row.goals_against}</td>
              <td className="py-2 pr-3 text-center font-display tabular-nums">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
