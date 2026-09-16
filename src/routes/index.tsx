import { createFileRoute, Navigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useAuth } from '#/lib/auth/auth-provider'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <Navigate to={status === 'signed-in' ? '/perfil' : '/entrar'} />
}
