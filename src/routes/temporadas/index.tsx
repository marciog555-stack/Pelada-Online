import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { BottomNav } from '#/components/layout/bottom-nav'
import { useSeasons, useIsPlatformAdmin } from '#/hooks/use-seasons'
import { SeasonCard } from '#/components/seasons/season-card'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'

export const Route = createFileRoute('/temporadas/')({ component: TemporadasPage })

function TemporadasPage() {
  return (
    <RequireAuth>
      <TemporadasContent />
    </RequireAuth>
  )
}

function TemporadasContent() {
  const { data: seasons, isLoading } = useSeasons()
  const { data: isAdmin } = useIsPlatformAdmin()

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <AppHeader title="Temporadas" />
      <div className="grid gap-4 px-4 py-6">
        <p className="text-sm text-muted-foreground">
          O ranking global soma os resultados de todas as ligas da plataforma dentro do período de cada temporada.
        </p>

        {isAdmin && (
          <Button asChild variant="secondary" size="sm" className="justify-self-start">
            <Link to="/temporadas/nova">
              <Plus className="size-4" /> Criar temporada
            </Link>
          </Button>
        )}

        {isLoading && <Skeleton className="h-16 w-full rounded-xl" />}

        {!isLoading && seasons?.length === 0 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Nenhuma temporada global criada ainda.
          </p>
        )}

        <div className="grid gap-3">
          {seasons?.map((season) => (
            <SeasonCard key={season.id} season={season} />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
