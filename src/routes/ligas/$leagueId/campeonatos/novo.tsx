import { createFileRoute } from '@tanstack/react-router'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { CreateCompetitionForm } from '#/components/competitions/create-competition-form'

export const Route = createFileRoute('/ligas/$leagueId/campeonatos/novo')({ component: NovoCampeonatoPage })

function NovoCampeonatoPage() {
  const { leagueId } = Route.useParams()
  return (
    <RequireAuth>
      <div className="mx-auto min-h-screen max-w-md pb-10">
        <AppHeader title="Criar campeonato" backTo={`/ligas/${leagueId}`} />
        <div className="px-4 py-6">
          <CreateCompetitionForm leagueId={leagueId} />
        </div>
      </div>
    </RequireAuth>
  )
}
