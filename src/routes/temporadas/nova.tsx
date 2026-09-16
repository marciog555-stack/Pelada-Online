import { createFileRoute, Navigate } from '@tanstack/react-router'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { useIsPlatformAdmin } from '#/hooks/use-seasons'
import { CreateSeasonForm } from '#/components/seasons/create-season-form'
import { Skeleton } from '#/components/ui/skeleton'

export const Route = createFileRoute('/temporadas/nova')({ component: NovaTemporadaPage })

function NovaTemporadaPage() {
  return (
    <RequireAuth>
      <NovaTemporadaContent />
    </RequireAuth>
  )
}

function NovaTemporadaContent() {
  const { data: isAdmin, isLoading } = useIsPlatformAdmin()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  if (!isAdmin) return <Navigate to="/temporadas" />

  return (
    <div className="mx-auto min-h-screen max-w-md pb-10">
      <AppHeader title="Criar temporada" backTo="/temporadas" />
      <div className="px-4 py-6">
        <CreateSeasonForm />
      </div>
    </div>
  )
}
