import { createFileRoute } from '@tanstack/react-router'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { BottomNav } from '#/components/layout/bottom-nav'
import { useCompetition, useCompetitionEditions } from '#/hooks/use-competitions'
import { useMyMembership } from '#/hooks/use-leagues'
import { PRESET_OPTIONS } from '#/lib/competitions/schemas'
import { presetThemeStyle } from '#/lib/competitions/preset-theme'
import { EditionCard } from '#/components/competitions/edition-card'
import { CreateEditionButton } from '#/components/competitions/create-edition-button'
import { Skeleton } from '#/components/ui/skeleton'
import { Badge } from '#/components/ui/badge'

const PRESET_LABELS: Record<string, string> = Object.fromEntries(
  PRESET_OPTIONS.map((option) => [option.value, option.label]),
)

export const Route = createFileRoute('/campeonatos/$competitionId/')({ component: CampeonatoPage })

function CampeonatoPage() {
  return (
    <RequireAuth>
      <CampeonatoContent />
    </RequireAuth>
  )
}

function CampeonatoContent() {
  const { competitionId } = Route.useParams()
  const { data: competition, isLoading: loadingCompetition } = useCompetition(competitionId)
  const { data: editions, isLoading: loadingEditions } = useCompetitionEditions(competitionId)
  const { data: membership } = useMyMembership(competition?.league_id)

  const isAdmin = membership?.role === 'owner' || membership?.role === 'admin'

  if (loadingCompetition || !competition) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  const nextNumber = (editions?.[0]?.number ?? 0) + 1

  return (
    <div
      className="mx-auto min-h-screen max-w-md bg-background pb-24"
      style={presetThemeStyle(competition.preset_id)}
    >
      <AppHeader title={competition.name} backTo={`/ligas/${competition.league_id}`} />
      <div className="grid gap-4 px-4 py-6">
        <Badge variant="outline" className="justify-self-start">
          {PRESET_LABELS[competition.preset_id]}
        </Badge>

        {isAdmin && <CreateEditionButton competitionId={competitionId} nextNumber={nextNumber} />}

        <div className="grid gap-3">
          {loadingEditions && <Skeleton className="h-16 w-full rounded-xl" />}
          {!loadingEditions && editions?.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhuma edição criada ainda.
            </p>
          )}
          {editions?.map((edition) => (
            <EditionCard key={edition.id} edition={edition} />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
