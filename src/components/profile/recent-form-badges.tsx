import { cn } from 'cn'
import type { Database } from '#/lib/supabase/types'

type RecentFormRow = Database['public']['Functions']['player_recent_form']['Returns'][number]

const RESULT_META: Record<string, { label: string; className: string }> = {
  V: { label: 'V', className: 'bg-success text-success-foreground' },
  E: { label: 'E', className: 'bg-warning text-warning-foreground' },
  D: { label: 'D', className: 'bg-destructive text-destructive-foreground' },
}

export function RecentFormBadges({
  form,
  className,
}: {
  form: RecentFormRow[] | null | undefined
  className?: string
}) {
  if (!form || form.length === 0) return null

  // Mais antiga primeiro, mais recente por último - lê como uma linha do
  // tempo (igual à sequência V-V-E-V-V que o pessoal já usa pra "forma").
  const ordered = [...form].reverse()

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {ordered.map((match) => {
        const meta = RESULT_META[match.result] ?? RESULT_META.E
        return (
          <span
            key={match.match_id}
            title={`${match.team_name} ${match.goals_for} x ${match.goals_against} ${match.opponent_team_name}`}
            className={cn(
              'flex size-6 items-center justify-center rounded-full text-[11px] font-semibold',
              meta.className,
            )}
          >
            {meta.label}
          </span>
        )
      })}
    </div>
  )
}
