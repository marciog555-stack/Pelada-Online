import { Trophy, Medal, Target, ShieldCheck } from 'lucide-react'
import type { EditionAward } from '#/hooks/use-competitions'

type AwardWithParticipant = EditionAward & {
  participant: { id: string; team_name: string; crest_url: string | null } | null
}

const AWARD_META: Partial<Record<string, { label: string; icon: typeof Trophy }>> = {
  champion: { label: 'Campeão', icon: Trophy },
  runner_up: { label: 'Vice-campeão', icon: Medal },
  top_scorer: { label: 'Artilheiro', icon: Target },
  best_defense: { label: 'Defesa menos vazada', icon: ShieldCheck },
}

const ORDER = ['champion', 'runner_up', 'top_scorer', 'best_defense']

export function EditionAwardsPanel({ awards }: { awards: AwardWithParticipant[] }) {
  if (awards.length === 0) return null

  const sorted = [...awards].sort((a, b) => ORDER.indexOf(a.award_type) - ORDER.indexOf(b.award_type))
  const champion = sorted.find((a) => a.award_type === 'champion')

  return (
    <div className="grid gap-3">
      {champion && champion.participant && (
        <div className="grid justify-items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 p-6 text-center">
          <Trophy className="size-8 text-primary" />
          <p className="font-display text-2xl">{champion.participant.team_name}</p>
          <p className="text-sm text-muted-foreground">é o campeão desta edição</p>
        </div>
      )}

      <div className="grid gap-2">
        {sorted
          .filter((a) => a.award_type !== 'champion')
          .map((award) => {
            const meta = AWARD_META[award.award_type]
            const Icon = meta?.icon ?? Trophy
            return (
              <div
                key={award.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <Icon className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{meta?.label ?? award.award_type}</p>
                  <p className="truncate text-sm font-medium">
                    {award.athlete_name ?? award.participant?.team_name ?? '—'}
                    {award.athlete_name && award.participant && (
                      <span className="text-muted-foreground"> · {award.participant.team_name}</span>
                    )}
                  </p>
                </div>
                {award.value !== null && (
                  <span className="font-display text-lg tabular-nums text-primary">{award.value}</span>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
