import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { z } from 'zod'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { useAuth } from '#/lib/auth/auth-provider'
import { findProfileIdByEfootballId } from '#/lib/auth/api'
import { IdClaimForm } from '#/components/profile/id-claim-form'
import { Alert, AlertDescription } from '#/components/ui/alert'

const searchSchema = z.object({ efootballId: z.string().min(1) })

export const Route = createFileRoute('/perfil/reivindicar-id')({
  validateSearch: searchSchema,
  component: ReivindicarIdPage,
})

function ReivindicarIdPage() {
  return (
    <RequireAuth>
      <ReivindicarIdContent />
    </RequireAuth>
  )
}

function ReivindicarIdContent() {
  const { efootballId } = Route.useSearch()
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)

  const targetQuery = useQuery({
    queryKey: ['profile-id-by-efootball-id', efootballId],
    queryFn: () => findProfileIdByEfootballId(efootballId),
  })

  return (
    <div className="mx-auto min-h-screen max-w-md pb-10">
      <AppHeader title="Esse ID é meu" backTo="/perfil" />
      <div className="grid gap-4 px-4 py-6">
        <p className="text-sm text-muted-foreground">
          Envie um print do seu perfil no eFootball mostrando o ID <strong>@{efootballId}</strong>. O admin da
          plataforma vai analisar e decidir.
        </p>

        {submitted ? (
          <Alert>
            <AlertDescription>
              Contestação enviada. Acompanhe o status na sua página de perfil.
            </AlertDescription>
          </Alert>
        ) : user && targetQuery.data ? (
          <IdClaimForm
            claimantId={user.id}
            targetProfileId={targetQuery.data}
            efootballId={efootballId}
            onSubmitted={() => setSubmitted(true)}
          />
        ) : targetQuery.isFetched ? (
          <Alert variant="destructive">
            <AlertDescription>Não encontramos nenhuma conta com esse ID.</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  )
}
