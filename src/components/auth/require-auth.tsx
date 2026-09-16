import { Navigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useAuth } from '#/lib/auth/auth-provider'

export function RequireAuth({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === 'signed-in') {
    return <Navigate to="/perfil" />
  }

  return <>{children}</>
}
