import { createFileRoute } from '@tanstack/react-router'
import { RedirectIfAuthed } from '#/components/auth/require-auth'
import { AuthShell } from '#/components/layout/auth-shell'
import { SignupForm } from '#/components/auth/signup-form'

export const Route = createFileRoute('/cadastrar')({ component: CadastrarPage })

function CadastrarPage() {
  return (
    <RedirectIfAuthed>
      <AuthShell title="Criar conta" subtitle="Use o mesmo ID que você usa no eFootball">
        <SignupForm />
      </AuthShell>
    </RedirectIfAuthed>
  )
}
