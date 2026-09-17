import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import type { Database } from '#/lib/supabase/types'

type StatsSummary = Database['public']['Functions']['player_match_stats_summary']['Returns'][number]

const ROWS: { key: keyof StatsSummary; label: string; suffix?: string }[] = [
  { key: 'avg_possession', label: 'Posse de bola', suffix: '%' },
  { key: 'avg_shots', label: 'Chutes por partida' },
  { key: 'avg_shots_on_target', label: 'Chutes a gol por partida' },
  { key: 'pass_accuracy', label: 'Precisão de passe', suffix: '%' },
  { key: 'avg_passes', label: 'Passes por partida' },
  { key: 'avg_corners', label: 'Escanteios por partida' },
  { key: 'avg_crosses', label: 'Cruzamentos por partida' },
  { key: 'avg_fouls', label: 'Faltas por partida' },
  { key: 'avg_offsides', label: 'Impedimentos por partida' },
  { key: 'avg_free_kicks', label: 'Cobranças de falta por partida' },
  { key: 'avg_interceptions', label: 'Interceptações por partida' },
  { key: 'avg_tackles', label: 'Desarmes por partida' },
  { key: 'avg_saves', label: 'Defesas por partida' },
]

export function PlayStyleCard({ summary }: { summary: StatsSummary | null | undefined }) {
  if (!summary || summary.matches_with_stats === 0) return null

  // avg()/pass_accuracy can be SQL null when every match is missing that field,
  // even though the generated Supabase types claim `number` (not nullable).
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const rows = ROWS.filter((row) => summary[row.key] !== null)
  if (rows.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estilo de jogo</CardTitle>
        <p className="text-xs text-muted-foreground">
          Média das últimas {summary.matches_with_stats}{' '}
          {summary.matches_with_stats === 1 ? 'partida com estatísticas preenchidas' : 'partidas com estatísticas preenchidas'}
        </p>
      </CardHeader>
      <CardContent className="grid gap-2">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between border-b border-border/50 py-1 last:border-0">
            <span className="text-sm text-muted-foreground">{row.label}</span>
            <span className="font-display tabular-nums text-primary">
              {summary[row.key]}
              {row.suffix}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
