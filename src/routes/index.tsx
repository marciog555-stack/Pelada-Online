import { createFileRoute, Navigate, Link } from '@tanstack/react-router'
import { Loader2, Plus, ChevronRight } from 'lucide-react'
import { useAuth } from '#/lib/auth/auth-provider'
import {
  useOwnProfile,
  usePlayerCareerSummary,
  usePlayerNextMatch,
  usePlayerRecentForm,
} from '#/hooks/use-profile'
import { useMyLeagues } from '#/hooks/use-leagues'
import { useMundials } from '#/hooks/use-mundial'
import { BottomNav } from '#/components/layout/bottom-nav'
import { LeagueCard } from '#/components/leagues/league-card'
import { MundialCard } from '#/components/mundial/mundial-card'
import { CareerSummaryCard } from '#/components/profile/career-summary-card'
import { MatchSpotlightCard } from '#/components/profile/match-spotlight-card'
import { RecentFormBadges } from '#/components/profile/recent-form-badges'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { EmptyState } from '#/components/ui/empty-state'
import { Skeleton } from '#/components/ui/skeleton'
import { initials } from '#/lib/text'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === 'signed-out') {
    return <Navigate to="/entrar" />
  }

  return <HomeContent />
}

function HomeContent() {
  const { user } = useAuth()
  const { data: profile } = useOwnProfile()
  const { data: memberships, isLoading: loadingLeagues } = useMyLeagues()
  const { data: mundials } = useMundials()
  const { data: careerSummary } = usePlayerCareerSummary(user?.id)
  const { data: recentForm } = usePlayerRecentForm(user?.id)
  const { data: nextMatch } = usePlayerNextMatch(user?.id)

  const activeLeagues = (memberships ?? []).filter((m) => m.status === 'active')
  const featuredMundial = mundials?.find((m) => m.status !== 'completed')

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <header className="flex items-center justify-between px-4 py-6">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Bem-vindo de volta</p>
          <p className="truncate font-display text-2xl">{profile?.display_name ?? 'Jogador'}</p>
          {recentForm && recentForm.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-[11px] text-muted-foreground">Forma recente</p>
              <RecentFormBadges form={recentForm} />
            </div>
          )}
        </div>
        <Link to="/perfil" className="shrink-0">
          <Avatar className="size-11 border border-border">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.display_name} />}
            <AvatarFallback>{initials(profile?.display_name ?? '?')}</AvatarFallback>
          </Avatar>
        </Link>
      </header>

      <div className="grid gap-6 px-4">
        {nextMatch && (
          <section className="grid gap-2">
            <p className="text-sm font-medium text-muted-foreground">Sua próxima partida</p>
            <MatchSpotlightCard match={nextMatch} />
          </section>
        )}

        {careerSummary && careerSummary.editions_played > 0 && <CareerSummaryCard summary={careerSummary} />}

        {featuredMundial && (
          <section className="grid gap-2">
            <p className="text-sm font-medium text-muted-foreground">Mundial</p>
            <MundialCard mundial={featuredMundial} />
          </section>
        )}

        <section className="grid gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Minhas ligas</p>
            {activeLeagues.length > 3 && (
              <Link to="/ligas" className="flex items-center text-xs text-primary">
                Ver todas
                <ChevronRight className="size-3.5" />
              </Link>
            )}
          </div>

          {loadingLeagues && <Skeleton className="h-16 w-full rounded-xl" />}

          {!loadingLeagues && activeLeagues.length === 0 && (
            <EmptyState>
              <div className="grid gap-3">
                <p>Você ainda não está em nenhuma liga. Crie a sua ou peça o link de convite pra galera.</p>
                <Button asChild size="sm" className="justify-self-center">
                  <Link to="/ligas/nova">
                    <Plus className="size-4" /> Criar liga
                  </Link>
                </Button>
              </div>
            </EmptyState>
          )}

          <div className="grid gap-3">
            {activeLeagues.slice(0, 3).map((m) => (
              <LeagueCard key={m.league.id} league={m.league} status={m.status} />
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
