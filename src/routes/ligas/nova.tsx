import { createFileRoute } from '@tanstack/react-router'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { CreateLeagueForm } from '#/components/leagues/create-league-form'

export const Route = createFileRoute('/ligas/nova')({ component: NovaLigaPage })

function NovaLigaPage() {
  return (
    <RequireAuth>
      <div className="mx-auto min-h-screen max-w-md pb-10">
        <AppHeader title="Criar liga" backTo="/ligas" />
        <div className="px-4 py-6">
          <CreateLeagueForm />
        </div>
      </div>
    </RequireAuth>
  )
}
