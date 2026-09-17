import { Trophy } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '#/components/ui/card'
import { TrophyCup } from '#/components/profile/trophy-cup'
import { TROPHY_ROWS, TROPHY_ROW_SIZE } from '#/lib/profile/trophies'
import type { Database } from '#/lib/supabase/types'

type Achievement = Database['public']['Functions']['player_achievements']['Returns'][number]
type TitleByPreset = Database['public']['Functions']['player_titles_by_preset']['Returns'][number]

export function TrophyRackCard({
  achievements,
  titlesByPreset,
}: {
  achievements: Achievement[] | undefined
  titlesByPreset: TitleByPreset[] | undefined
}) {
  const mundialCount = achievements?.find((a) => a.achievement_type === 'mundial_champion')?.achievement_count ?? 0
  const presetCounts = new Map((titlesByPreset ?? []).map((t) => [t.preset_id, t.title_count]))

  function countFor(key: string): number {
    return key === 'mundial' ? mundialCount : (presetCounts.get(key) ?? 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-gold" /> Vitrine de taças
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {TROPHY_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-6">
            {row.map((trophy) => {
              const count = countFor(trophy.key)
              const earned = count > 0
              const size = TROPHY_ROW_SIZE[rowIndex]
              return (
                <div key={trophy.key} className="relative grid justify-items-center gap-1">
                  {earned && count > 1 && (
                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-gold-foreground">
                      {count}
                    </span>
                  )}
                  <TrophyCup size={size} earned={earned} className={earned ? '' : 'text-muted-foreground/30'} />
                  <p
                    className={
                      earned
                        ? 'max-w-20 text-center text-[11px] leading-tight font-medium text-foreground'
                        : 'max-w-20 text-center text-[11px] leading-tight text-muted-foreground/60'
                    }
                  >
                    {trophy.label}
                  </p>
                </div>
              )
            })}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
