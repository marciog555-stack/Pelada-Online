import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { drawChampionShareCard, canvasToFile, shareOrDownloadFile } from '#/lib/share/card-canvas'
import { Button } from '#/components/ui/button'

export function ShareChampionCardButton({
  competitionName,
  editionNumber,
  championTeamName,
  crestUrl,
  runnerUpTeamName,
}: {
  competitionName: string
  editionNumber: number
  championTeamName: string
  crestUrl: string | null
  runnerUpTeamName?: string | null
}) {
  const [busy, setBusy] = useState(false)

  async function handleShare() {
    setBusy(true)
    try {
      const canvas = await drawChampionShareCard({
        competitionName,
        editionNumber,
        championTeamName,
        crestUrl,
        runnerUpTeamName,
      })
      const file = await canvasToFile(canvas, `campeao-${competitionName}-edicao-${editionNumber}.png`)
      await shareOrDownloadFile(
        file,
        'Pelada Online',
        `${championTeamName} é campeão de ${competitionName} - Edição ${editionNumber}!`,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleShare} disabled={busy} className="w-full">
      <Share2 className="size-4" /> {busy ? 'Gerando…' : 'Compartilhar resultado'}
    </Button>
  )
}
