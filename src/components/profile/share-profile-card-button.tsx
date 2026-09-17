import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { drawPlayerShareCard, canvasToFile, shareOrDownloadFile } from '#/lib/share/card-canvas'
import { ACHIEVEMENT_META, ACHIEVEMENT_ORDER } from '#/lib/profile/achievements'
import { Button } from '#/components/ui/button'
import type { Database } from '#/lib/supabase/types'

type CareerSummary = Database['public']['Functions']['player_career_summary']['Returns'][number]
type Achievement = Database['public']['Functions']['player_achievements']['Returns'][number]

export function ShareProfileCardButton({
  displayName,
  efootballId,
  avatarUrl,
  summary,
  achievements,
}: {
  displayName: string
  efootballId: string
  avatarUrl: string | null
  summary: CareerSummary | null | undefined
  achievements: Achievement[] | undefined
}) {
  const [busy, setBusy] = useState(false)

  async function handleShare() {
    setBusy(true)
    try {
      const earned = new Set((achievements ?? []).map((a) => a.achievement_type))
      const achievementLabels = ACHIEVEMENT_ORDER.filter((type) => earned.has(type)).map(
        (type) => ACHIEVEMENT_META[type].label,
      )
      const canvas = await drawPlayerShareCard({
        displayName,
        efootballId,
        avatarUrl,
        titles: summary?.titles ?? 0,
        editionsPlayed: summary?.editions_played ?? 0,
        achievementLabels,
      })
      const file = await canvasToFile(canvas, `${efootballId}-pelada-online.png`)
      await shareOrDownloadFile(file, 'Pelada Online', `Perfil de ${displayName} na Pelada Online`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleShare} disabled={busy} className="w-full">
      <Share2 className="size-4" /> {busy ? 'Gerando…' : 'Compartilhar perfil'}
    </Button>
  )
}
