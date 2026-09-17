import { Card, CardContent } from '#/components/ui/card'
import type { Database } from '#/lib/supabase/types'

type CareerSummary = Database['public']['Functions']['player_career_summary']['Returns'][number]

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="grid justify-items-center gap-0.5 text-center">
      <p className="font-display text-xl tabular-nums text-primary">{value}</p>
      <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
    </div>
  )
}

export function CareerSummaryCard({ summary }: { summary: CareerSummary | null | undefined }) {
  if (!summary || summary.editions_played === 0) return null

  const winRate = summary.played > 0 ? Math.round((summary.wins / summary.played) * 100) : 0

  return (
    <Card>
      <CardContent className="grid grid-cols-3 gap-4 pt-6 sm:grid-cols-4">
        <Stat label="Edições" value={summary.editions_played} />
        <Stat label="Títulos" value={summary.titles} />
        <Stat label="Aproveitamento" value={`${winRate}%`} />
        <Stat label="V-E-D" value={`${summary.wins}-${summary.draws}-${summary.losses}`} />
        <Stat label="Gols" value={summary.goals} />
        <Stat label="Assistências" value={summary.assists} />
        <Stat label="Saldo de gols" value={summary.goals_for - summary.goals_against} />
      </CardContent>
    </Card>
  )
}
