import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Users } from 'lucide-react'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { getLeaguePreview, joinLeagueByInviteCode } from '#/lib/leagues/api'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Skeleton } from '#/components/ui/skeleton'

export const Route = createFileRoute('/convite/$inviteCode')({ component: ConvitePage })

function ConvitePage() {
  return (
    <RequireAuth>
      <ConviteContent />
    </RequireAuth>
  )
}

function ConviteContent() {
  const { inviteCode } = Route.useParams()
  const navigate = useNavigate()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preview = useQuery({
    queryKey: ['league-preview', inviteCode],
    queryFn: () => getLeaguePreview(inviteCode),
  })

  async function handleJoin() {
    setJoining(true)
    setError(null)
    try {
      const membership = await joinLeagueByInviteCode(inviteCode)
      navigate({ to: '/ligas/$leagueId', params: { leagueId: membership.league_id } })
    } catch {
      setError('Não foi possível entrar na liga. Tente de novo.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-md pb-10">
      <AppHeader title="Convite" backTo="/ligas" />
      <div className="grid gap-4 px-4 py-6">
        {preview.isLoading && <Skeleton className="h-40 w-full rounded-xl" />}

        {!preview.isLoading && !preview.data && (
          <Alert variant="destructive">
            <AlertDescription>Esse link de convite não é válido.</AlertDescription>
          </Alert>
        )}

        {preview.data && (
          <div className="grid gap-4 rounded-xl border border-border bg-card p-6 text-center">
            <div>
              <p className="font-display text-2xl">{preview.data.name}</p>
              {preview.data.description && (
                <p className="mt-1 text-sm text-muted-foreground">{preview.data.description}</p>
              )}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Users className="size-3.5" />
                {preview.data.member_count} {preview.data.member_count === 1 ? 'membro' : 'membros'}
              </Badge>
            </div>
            {preview.data.require_approval && (
              <p className="text-xs text-muted-foreground">
                Essa liga aprova a entrada manualmente. Você pode ficar pendente até um admin liberar.
              </p>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleJoin} disabled={joining}>
              {joining ? 'Entrando…' : 'Entrar na liga'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
