import { createFileRoute } from '@tanstack/react-router'
import { RedirectIfAuthed } from '#/components/auth/require-auth'
import { AuthShell } from '#/components/layout/auth-shell'
import { LoginForm } from '#/components/auth/login-form'

export const Route = createFileRoute('/entrar')({ component: EntrarPage })

function EntrarPage() {
  return (
    <RedirectIfAuthed>
      <AuthShell title="Entrar" subtitle="Use seu ID do eFootball e sua senha">
        <LoginForm />
      </AuthShell>
    </RedirectIfAuthed>
  )
}
