import { createFileRoute } from '@tanstack/react-router'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { usePublicProfile } from '#/hooks/use-profile'
import { PublicProfileCard } from '#/components/profile/public-profile-card'
import { Skeleton } from '#/components/ui/skeleton'
import { Alert, AlertDescription } from '#/components/ui/alert'

export const Route = createFileRoute('/jogador/$efootballId')({ component: JogadorPage })

function JogadorPage() {
  return (
    <RequireAuth>
      <JogadorContent />
    </RequireAuth>
  )
}

function JogadorContent() {
  const { efootballId } = Route.useParams()
  const { data: profile, isLoading } = usePublicProfile(efootballId)

  return (
    <div className="mx-auto min-h-screen max-w-md pb-10">
      <AppHeader title={`@${efootballId}`} backTo="/perfil" />
      <div className="px-4 py-6">
        {isLoading ? (
          <Skeleton className="mx-auto size-24 rounded-full" />
        ) : profile ? (
          <PublicProfileCard profile={profile} />
        ) : (
          <Alert variant="destructive">
            <AlertDescription>Não encontramos esse jogador.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
