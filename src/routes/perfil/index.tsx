import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { BottomNav } from '#/components/layout/bottom-nav'
import { useAuth } from '#/lib/auth/auth-provider'
import { useOwnProfile, useInvalidateOwnProfile } from '#/hooks/use-profile'
import { AvatarUploader } from '#/components/profile/avatar-uploader'
import { ProfileEditForm } from '#/components/profile/profile-edit-form'
import { IdClaimsList } from '#/components/profile/id-claims-list'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import { Separator } from '#/components/ui/separator'
import { supabase } from '#/lib/supabase/client'

export const Route = createFileRoute('/perfil/')({ component: PerfilPage })

function PerfilPage() {
  return (
    <RequireAuth>
      <PerfilContent />
    </RequireAuth>
  )
}

function PerfilContent() {
  const { signOut } = useAuth()
  const { data: profile, isLoading } = useOwnProfile()
  const invalidate = useInvalidateOwnProfile()
  const navigate = useNavigate()
  const [claimId, setClaimId] = useState('')

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Skeleton className="mx-auto size-24 rounded-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <AppHeader title="Minha conta" />
      <div className="grid gap-6 px-4 py-6">
        <AvatarUploader
          userId={profile.id}
          displayName={profile.display_name}
          avatarUrl={profile.avatar_url}
          onUploaded={async (url) => {
            await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
            invalidate()
          }}
        />

        <div className="text-center">
          <p className="font-display text-2xl">@{profile.efootball_id}</p>
          <Link
            to="/jogador/$efootballId"
            params={{ efootballId: profile.efootball_id }}
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            Ver perfil público
          </Link>
        </div>

        <Separator />

        <ProfileEditForm profile={profile} onSaved={invalidate} />

        <Separator />

        <IdClaimsList />

        <div className="grid gap-2 rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium">Um ID seu está sendo usado por outra conta?</p>
          <div className="flex gap-2">
            <Input
              value={claimId}
              onChange={(event) => setClaimId(event.target.value)}
              placeholder="ID em disputa"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={!claimId.trim()}
              onClick={() =>
                navigate({ to: '/perfil/reivindicar-id', search: { efootballId: claimId.trim() } })
              }
            >
              Reivindicar
            </Button>
          </div>
        </div>

        <Button variant="outline" onClick={signOut}>
          Sair
        </Button>
      </div>
      <BottomNav />
    </div>
  )
}
