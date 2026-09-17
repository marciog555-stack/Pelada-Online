import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { BottomNav } from '#/components/layout/bottom-nav'
import { useMundials } from '#/hooks/use-mundial'
import { useIsPlatformAdmin } from '#/hooks/use-seasons'
import { MundialCard } from '#/components/mundial/mundial-card'
import { mundialThemeStyle } from '#/lib/mundial/theme'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'

export const Route = createFileRoute('/mundial/')({ component: MundialListPage })

function MundialListPage() {
  return (
    <RequireAuth>
      <MundialListContent />
    </RequireAuth>
  )
}

function MundialListContent() {
  const { data: mundials, isLoading } = useMundials()
  const { data: isAdmin } = useIsPlatformAdmin()

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-24" style={mundialThemeStyle()}>
      <AppHeader title="Mundial" />
      <div className="grid gap-4 px-4 py-6">
        <p className="text-sm text-muted-foreground">
          O Mundial reúne os campeões de cada liga da temporada numa chave eliminatória entre plataformas.
        </p>

        {isAdmin && (
          <Button asChild variant="secondary" size="sm" className="justify-self-start">
            <Link to="/mundial/nova">
              <Plus className="size-4" /> Criar Mundial
            </Link>
          </Button>
        )}

        {isLoading && <Skeleton className="h-16 w-full rounded-xl" />}

        {!isLoading && mundials?.length === 0 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">Nenhum Mundial criado ainda.</p>
        )}

        <div className="grid gap-3">
          {mundials?.map((mundial) => (
            <MundialCard key={mundial.id} mundial={mundial} />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
