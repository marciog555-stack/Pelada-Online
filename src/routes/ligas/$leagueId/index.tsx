import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Trophy, Users2, Swords, BarChart3, Clock } from 'lucide-react'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { BottomNav } from '#/components/layout/bottom-nav'
import { useAuth } from '#/lib/auth/auth-provider'
import { useLeague, useLeagueMembers, useMyMembership, useInvalidateLeague } from '#/hooks/use-leagues'
import { useLeagueCompetitions } from '#/hooks/use-competitions'
import { MembersList } from '#/components/leagues/members-list'
import { CompetitionCard } from '#/components/competitions/competition-card'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'

export const Route = createFileRoute('/ligas/$leagueId/')({ component: LigaPage })

function LigaPage() {
  return (
    <RequireAuth>
      <LigaContent />
    </RequireAuth>
  )
}

function LigaContent() {
  const { leagueId } = Route.useParams()
  const { user } = useAuth()
  const { data: league, isLoading: loadingLeague } = useLeague(leagueId)
  const { data: membership, isLoading: loadingMembership } = useMyMembership(leagueId)
  const { data: members, isLoading: loadingMembers } = useLeagueMembers(leagueId)
  const { data: competitions, isLoading: loadingCompetitions } = useLeagueCompetitions(leagueId)
  const invalidate = useInvalidateLeague(leagueId)

  if (loadingLeague || loadingMembership) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  if (!league || !membership) {
    return (
      <div className="mx-auto min-h-screen max-w-md pb-10">
        <AppHeader title="Liga" backTo="/ligas" />
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Essa liga não existe ou você não faz parte dela.
        </p>
      </div>
    )
  }

  if (membership.status === 'pending') {
    return (
      <div className="mx-auto min-h-screen max-w-md pb-10">
        <AppHeader title={league.name} backTo="/ligas" />
        <div className="grid gap-3 px-4 py-10 text-center">
          <Clock className="mx-auto size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Seu pedido de entrada em <strong>{league.name}</strong> está aguardando aprovação de um admin.
          </p>
        </div>
      </div>
    )
  }

  const isAdmin = membership.role === 'owner' || membership.role === 'admin'

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <AppHeader title={league.name} backTo="/ligas" />
      <div className="grid gap-4 px-4 py-6">
        {league.description && <p className="text-sm text-muted-foreground">{league.description}</p>}

        <Button asChild variant="secondary">
          <Link to="/ligas/$leagueId/convidar" params={{ leagueId }}>
            Convidar amigos
          </Link>
        </Button>

        <Tabs defaultValue="campeonatos">
          <TabsList className="w-full">
            <TabsTrigger value="campeonatos" className="flex-col gap-1 text-[11px]">
              <Swords className="size-4" />
              Jogos
            </TabsTrigger>
            <TabsTrigger value="campeoes" className="flex-col gap-1 text-[11px]">
              <Trophy className="size-4" />
              Campeões
            </TabsTrigger>
            <TabsTrigger value="estatisticas" className="flex-col gap-1 text-[11px]">
              <BarChart3 className="size-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="membros" className="flex-col gap-1 text-[11px]">
              <Users2 className="size-4" />
              Membros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campeonatos" className="grid gap-3 pt-4">
            <Button asChild variant="secondary" size="sm" className="justify-self-start">
              <Link to="/ligas/$leagueId/campeonatos/novo" params={{ leagueId }}>
                <Plus className="size-4" /> Criar campeonato
              </Link>
            </Button>

            {loadingCompetitions && <Skeleton className="h-16 w-full rounded-xl" />}

            {!loadingCompetitions && competitions?.length === 0 && (
              <EmptyState text="Nenhum campeonato criado ainda nessa liga." />
            )}

            {competitions?.map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </TabsContent>

          <TabsContent value="campeoes" className="pt-4">
            <EmptyState text="A galeria de campeões aparece aqui quando a primeira edição terminar." />
          </TabsContent>

          <TabsContent value="estatisticas" className="pt-4">
            <div className="grid gap-4">
              <EmptyState text="Ranking interno: aparece quando houver partidas confirmadas." />
              <EmptyState text="Artilheiros: aparece quando houver gols registrados." />
            </div>
          </TabsContent>

          <TabsContent value="membros" className="pt-4">
            {loadingMembers || !members ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : (
              <MembersList
                members={members}
                isAdmin={isAdmin}
                currentUserId={user?.id}
                onChanged={invalidate}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}
