import { Navigate, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '#/lib/auth/auth-provider'
import { PENDING_ID_CLAIM_KEY } from '#/lib/auth/pending-claim'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const navigate = useNavigate()

  // Se o cadastro deixou uma contestação de ID pendente (fluxo "esse ID é
  // meu"), manda pra lá assim que a primeira tela autenticada montar -
  // não importa se o pouso pós-login for /ligas, /perfil etc.
  useEffect(() => {
    if (status !== 'signed-in') return
    const pendingClaim = localStorage.getItem(PENDING_ID_CLAIM_KEY)
    if (pendingClaim) {
      localStorage.removeItem(PENDING_ID_CLAIM_KEY)
      navigate({ to: '/perfil/reivindicar-id', search: { efootballId: pendingClaim } })
    }
  }, [status, navigate])

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
    return <Navigate to="/" />
  }

  return <>{children}</>
}
