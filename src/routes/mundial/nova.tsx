import { createFileRoute, Navigate } from '@tanstack/react-router'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { useIsPlatformAdmin } from '#/hooks/use-seasons'
import { CreateMundialForm } from '#/components/mundial/create-mundial-form'
import { Skeleton } from '#/components/ui/skeleton'

export const Route = createFileRoute('/mundial/nova')({ component: NovoMundialPage })

function NovoMundialPage() {
  return (
    <RequireAuth>
      <NovoMundialContent />
    </RequireAuth>
  )
}

function NovoMundialContent() {
  const { data: isAdmin, isLoading } = useIsPlatformAdmin()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  if (!isAdmin) return <Navigate to="/mundial" />

  return (
    <div className="mx-auto min-h-screen max-w-md pb-10">
      <AppHeader title="Criar Mundial" backTo="/mundial" />
      <div className="px-4 py-6">
        <CreateMundialForm />
      </div>
    </div>
  )
}
