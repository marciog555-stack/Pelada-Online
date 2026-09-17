import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { drawMatchResultShareCard, canvasToFile, shareOrDownloadFile } from '#/lib/share/card-canvas'
import { Button } from '#/components/ui/button'

type Side = { team_name: string; crest_url: string | null }

export function ShareMatchResultCardButton({
  competitionName,
  editionNumber,
  home,
  away,
  homeGoals,
  awayGoals,
}: {
  competitionName: string
  editionNumber: number
  home: Side
  away: Side
  homeGoals: number
  awayGoals: number
}) {
  const [busy, setBusy] = useState(false)

  async function handleShare() {
    setBusy(true)
    try {
      const canvas = await drawMatchResultShareCard({
        competitionName,
        editionNumber,
        homeTeamName: home.team_name,
        homeCrestUrl: home.crest_url,
        awayTeamName: away.team_name,
        awayCrestUrl: away.crest_url,
        homeGoals,
        awayGoals,
      })
      const file = await canvasToFile(canvas, `placar-${home.team_name}-${away.team_name}.png`)
      await shareOrDownloadFile(
        file,
        'Pelada Online',
        `${home.team_name} ${homeGoals} x ${awayGoals} ${away.team_name} - ${competitionName}`,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleShare} disabled={busy} className="w-full">
      <Share2 className="size-4" /> {busy ? 'Gerando…' : 'Compartilhar placar'}
    </Button>
  )
}
