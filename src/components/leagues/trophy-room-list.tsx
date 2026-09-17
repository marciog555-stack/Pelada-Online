import { Link } from '@tanstack/react-router'
import { Trophy } from 'lucide-react'
import type { Tables } from '#/lib/supabase/types'

type Champion = { id: string; team_name: string; crest_url: string | null }
type ChampionEdition = Tables<'editions'> & {
  competition: { id: string; name: string; preset_id: string }
  champion: Champion[]
}

export function TrophyRoomList({ editions }: { editions: ChampionEdition[] }) {
  if (editions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        A galeria de campeões aparece aqui quando a primeira edição terminar.
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {editions.map((edition) => {
        const champion = edition.champion.at(0)
        return (
          <Link
            key={edition.id}
            to="/edicoes/$editionId"
            params={{ editionId: edition.id }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
          >
            <Trophy className="size-6 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {edition.competition.name} · Edição {edition.number}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {champion ? `Campeão: ${champion.team_name}` : 'Campeão a definir'}
              </p>
            </div>
            {champion?.crest_url ? (
              <img src={champion.crest_url} alt="" className="size-8 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="size-8 shrink-0 rounded-full bg-secondary" />
            )}
          </Link>
        )
      })}
    </div>
  )
}
