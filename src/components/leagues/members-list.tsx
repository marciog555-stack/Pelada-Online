import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { MoreVertical } from 'lucide-react'
import { approveMember, removeMember, setMemberRole } from '#/lib/leagues/api'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { initials } from '#/lib/text'
import type { LeagueMemberWithProfile } from '#/hooks/use-leagues'

const ROLE_LABELS: Record<string, string> = { owner: 'Dono', admin: 'Admin', member: 'Membro' }

export function MembersList({
  members,
  isAdmin,
  currentUserId,
  onChanged,
}: {
  members: LeagueMemberWithProfile[]
  isAdmin: boolean
  currentUserId: string | undefined
  onChanged: () => void
}) {
  const [busyId, setBusyId] = useState<string | null>(null)

  const pending = members.filter((m) => m.status === 'pending')
  const active = members.filter((m) => m.status === 'active')

  async function run(id: string, fn: () => Promise<void>) {
    setBusyId(id)
    try {
      await fn()
      onChanged()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="grid gap-6">
      {isAdmin && pending.length > 0 && (
        <div className="grid gap-2">
          <p className="text-sm font-medium text-muted-foreground">Pedidos de entrada</p>
          {pending.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <MemberAvatar member={m} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.profile.display_name}</p>
                <p className="truncate text-xs text-muted-foreground">@{m.profile.efootball_id}</p>
              </div>
              <Button size="sm" disabled={busyId === m.id} onClick={() => run(m.id, () => approveMember(m.id))}>
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === m.id}
                onClick={() => run(m.id, () => removeMember(m.id))}
              >
                Recusar
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-2">
        <p className="text-sm font-medium text-muted-foreground">Membros ({active.length})</p>
        {active.map((m) => {
          const canManage = isAdmin && m.role !== 'owner' && m.user_id !== currentUserId
          return (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <Link
                to="/jogador/$efootballId"
                params={{ efootballId: m.profile.efootball_id }}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <MemberAvatar member={m} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.profile.display_name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{m.profile.efootball_id}</p>
                </div>
              </Link>
              <Badge variant={m.role === 'owner' ? 'default' : 'outline'}>{ROLE_LABELS[m.role]}</Badge>
              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" disabled={busyId === m.id}>
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {m.role === 'member' ? (
                      <DropdownMenuItem onClick={() => run(m.id, () => setMemberRole(m.id, 'admin'))}>
                        Tornar admin
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => run(m.id, () => setMemberRole(m.id, 'member'))}>
                        Tirar admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => run(m.id, () => removeMember(m.id))}
                    >
                      Remover da liga
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MemberAvatar({ member }: { member: LeagueMemberWithProfile }) {
  return (
    <Avatar>
      <AvatarImage src={member.profile.avatar_url ?? undefined} alt={member.profile.display_name} />
      <AvatarFallback>{initials(member.profile.display_name)}</AvatarFallback>
    </Avatar>
  )
}
