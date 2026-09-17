import { Link } from '@tanstack/react-router'
import { Pencil } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { PLATFORM_OPTIONS } from '#/lib/auth/schemas'
import { initials } from '#/lib/text'
import { useAuth } from '#/lib/auth/auth-provider'
import {
  usePlayerCareerSummary,
  usePlayerCareerHistory,
  usePlayerAchievements,
  usePlayerTitlesByPreset,
  usePlayerRecentForm,
  usePlayerMatchStatsSummary,
} from '#/hooks/use-profile'
import type { Profile } from '#/hooks/use-profile'
import { CareerSummaryCard } from '#/components/profile/career-summary-card'
import { RecentFormBadges } from '#/components/profile/recent-form-badges'
import { TrophyRackCard } from '#/components/profile/trophy-rack-card'
import { AchievementsGrid } from '#/components/profile/achievements-grid'
import { CareerHistoryList } from '#/components/profile/career-history-list'
import { ShareProfileCardButton } from '#/components/profile/share-profile-card-button'
import { PlayStyleCard } from '#/components/profile/play-style-card'

const PLATFORM_LABELS: Record<string, string> = Object.fromEntries(
  PLATFORM_OPTIONS.map((option) => [option.value, option.label]),
)

export function PublicProfileCard({ profile }: { profile: Profile }) {
  const { user } = useAuth()
  const isOwnProfile = user?.id === profile.id
  const location = [profile.city, profile.state].filter(Boolean).join(' - ')
  const { data: summary, isLoading: loadingSummary } = usePlayerCareerSummary(profile.id)
  const { data: history } = usePlayerCareerHistory(profile.id)
  const { data: achievements } = usePlayerAchievements(profile.id)
  const { data: titlesByPreset } = usePlayerTitlesByPreset(profile.id)
  const { data: recentForm } = usePlayerRecentForm(profile.id)
  const { data: statsSummary } = usePlayerMatchStatsSummary(profile.id)

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
          {isOwnProfile && (
            <Button asChild variant="outline" size="sm">
              <Link to="/perfil">
                <Pencil className="size-4" /> Editar perfil
              </Link>
            </Button>
          )}
          {recentForm && recentForm.length > 0 && (
            <div className="flex items-center justify-center gap-2 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">Forma recente</p>
              <RecentFormBadges form={recentForm} />
            </div>
          )}
        </CardContent>
      </Card>

      {loadingSummary ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : summary && summary.editions_played > 0 ? (
        <>
          <CareerSummaryCard summary={summary} />
          <PlayStyleCard summary={statsSummary} />
          <TrophyRackCard achievements={achievements} titlesByPreset={titlesByPreset} />
          <AchievementsGrid achievements={achievements} />
          <ShareProfileCardButton
            displayName={profile.display_name}
            efootballId={profile.efootball_id}
            avatarUrl={profile.avatar_url}
            summary={summary}
            achievements={achievements}
          />
          <CareerHistoryList history={history} />
        </>
      ) : (
        <>
          <PlayStyleCard summary={statsSummary} />
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Ainda sem histórico por aqui. As edições disputadas e as conquistas aparecem assim que{' '}
                {profile.display_name} encerrar a primeira edição.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
