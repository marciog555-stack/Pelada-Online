import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { BottomNav } from '#/components/layout/bottom-nav'
import { useMyLeagues } from '#/hooks/use-leagues'
import { LeagueCard } from '#/components/leagues/league-card'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'

export const Route = createFileRoute('/ligas/')({ component: LigasPage })

function LigasPage() {
  return (
    <RequireAuth>
      <LigasContent />
    </RequireAuth>
  )
}

function LigasContent() {
  const { data: memberships, isLoading } = useMyLeagues()

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <AppHeader title="Minhas ligas" />
      <div className="grid gap-4 px-4 py-6">
        <Button asChild>
          <Link to="/ligas/nova">
            <Plus className="size-4" /> Criar liga
          </Link>
        </Button>

        {isLoading && (
          <div className="grid gap-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && memberships?.length === 0 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Você ainda não está em nenhuma liga. Crie a sua ou peça o link de convite pra galera.
          </p>
        )}

        <div className="grid gap-3">
          {memberships?.map((m) => (
            <LeagueCard key={m.league.id} league={m.league} status={m.status} />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
