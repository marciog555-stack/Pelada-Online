import { Trophy } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { PLATFORM_OPTIONS } from '#/lib/auth/schemas'
import { initials } from '#/lib/text'
import type { Profile } from '#/hooks/use-profile'

const PLATFORM_LABELS: Record<string, string> = Object.fromEntries(
  PLATFORM_OPTIONS.map((option) => [option.value, option.label]),
)

export function PublicProfileCard({ profile }: { profile: Profile }) {
  const location = [profile.city, profile.state].filter(Boolean).join(' - ')

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <Avatar size="lg" className="size-24 border-2 border-border">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.display_name} />
            <AvatarFallback className="text-2xl">{initials(profile.display_name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-2xl leading-none">{profile.display_name}</p>
            {profile.nickname && (
              <p className="text-sm text-muted-foreground">"{profile.nickname}"</p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary">@{profile.efootball_id}</Badge>
            <Badge variant="outline">{PLATFORM_LABELS[profile.platform] ?? profile.platform}</Badge>
            {location && <Badge variant="outline">{location}</Badge>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4 text-gold" /> Sala de troféus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ainda sem troféus por aqui. Os títulos aparecem assim que {profile.display_name} disputar e vencer um
            campeonato.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
