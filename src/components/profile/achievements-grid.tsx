import { Lock, Trophy } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '#/components/ui/card'
import { ACHIEVEMENT_META, ACHIEVEMENT_ORDER } from '#/lib/profile/achievements'
import type { Database } from '#/lib/supabase/types'

type Achievement = Database['public']['Functions']['player_achievements']['Returns'][number]

export function AchievementsGrid({ achievements }: { achievements: Achievement[] | undefined }) {
  const earned = new Map((achievements ?? []).map((a) => [a.achievement_type, a]))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-gold" /> Conquistas especiais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {ACHIEVEMENT_ORDER.map((type) => {
            const meta = ACHIEVEMENT_META[type]
            const achievement = earned.get(type)
            const isEarned = !!achievement
            const Icon = meta.icon

            return (
              <div
                key={type}
                title={meta.description}
                className={
                  isEarned
                    ? 'relative grid justify-items-center gap-1 rounded-xl border border-gold/40 bg-gold/10 p-3 text-center'
                    : 'relative grid justify-items-center gap-1 rounded-xl border border-dashed border-border p-3 text-center opacity-40'
                }
              >
                {isEarned && achievement.achievement_count > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-gold-foreground">
                    {achievement.achievement_count}
                  </span>
                )}
                {isEarned ? (
                  <Icon className="size-6 text-gold" />
                ) : (
                  <Lock className="size-6 text-muted-foreground" />
                )}
                <p className="text-[11px] leading-tight font-medium">{meta.label}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
