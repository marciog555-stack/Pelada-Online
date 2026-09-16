import { useState } from 'react'
import { addMundialSlot } from '#/lib/mundial/api'
import { Button } from '#/components/ui/button'
import { Alert, AlertDescription } from '#/components/ui/alert'
import type { Database } from '#/lib/supabase/types'

type EligibleRow = Database['public']['Functions']['mundial_eligible_champions']['Returns'][number]

export function EligibleChampionsList({
  mundialId,
  rows,
  isAdmin,
  onChanged,
}: {
  mundialId: string
  rows: EligibleRow[]
  isAdmin: boolean
  onChanged: () => void
}) {
  const [busyLeagueId, setBusyLeagueId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pending = rows.filter((r) => !r.slot_id)

  async function handleAdd(row: EligibleRow) {
    setBusyLeagueId(row.league_id)
    setError(null)
    try {
      await addMundialSlot({
        mundialId,
        leagueId: row.league_id,
        editionId: row.edition_id,
        userId: row.user_id,
        teamName: row.team_name,
        crestUrl: row.crest_url,
      })
      onChanged()
    } catch {
      setError('Não foi possível adicionar essa vaga. Tente de novo.')
    } finally {
      setBusyLeagueId(null)
    }
  }

  if (pending.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Nenhum campeão elegível pendente. Campeões aparecem aqui quando uma edição encerra dentro do período da
        temporada.
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {pending.map((row) => (
        <div key={row.league_id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          {row.crest_url ? (
            <img src={row.crest_url} alt="" className="size-8 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="size-8 shrink-0 rounded-full bg-secondary" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{row.team_name}</p>
            <p className="truncate text-xs text-muted-foreground">
              Campeão · {row.league_name} · @{row.efootball_id}
            </p>
          </div>
          {isAdmin && (
            <Button size="sm" variant="secondary" disabled={busyLeagueId === row.league_id} onClick={() => handleAdd(row)}>
              Adicionar vaga
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
