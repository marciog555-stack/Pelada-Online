import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { createEdition } from '#/lib/competitions/api'
import { Button } from '#/components/ui/button'

export function CreateEditionButton({ competitionId, nextNumber }: { competitionId: string; nextNumber: number }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setBusy(true)
    try {
      const edition = await createEdition(competitionId, nextNumber)
      navigate({ to: '/edicoes/$editionId', params: { editionId: edition.id } })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={busy} size="sm" variant="secondary" className="justify-self-start">
      <Plus className="size-4" /> {busy ? 'Criando…' : `Nova edição (#${nextNumber})`}
    </Button>
  )
}
