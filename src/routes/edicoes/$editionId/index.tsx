import { createFileRoute } from '@tanstack/react-router'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { BottomNav } from '#/components/layout/bottom-nav'
import { useAuth } from '#/lib/auth/auth-provider'
import { useMyMembership } from '#/hooks/use-leagues'
import {
  useEdition,
  useCompetition,
  useEditionParticipants,
  useMyEditionParticipant,
  useEditionMatches,
  useCrestChangeRequests,
  useInvalidateEdition,
} from '#/hooks/use-competitions'
import { joinEdition } from '#/lib/competitions/api'
import { EditionParticipantsPanel } from '#/components/competitions/edition-participants-panel'
import { JoinEditionForm } from '#/components/competitions/join-edition-form'
import { MatchList } from '#/components/competitions/match-list'
import { CrestChangeRequestsPanel } from '#/components/competitions/crest-change-requests-panel'
import { Skeleton } from '#/components/ui/skeleton'

export const Route = createFileRoute('/edicoes/$editionId/')({ component: EdicaoPage })

function EdicaoPage() {
  return (
    <RequireAuth>
      <EdicaoContent />
    </RequireAuth>
  )
}

function EdicaoContent() {
  const { editionId } = Route.useParams()
  const { user } = useAuth()
  const { data: edition, isLoading: loadingEdition } = useEdition(editionId)
  const { data: competition } = useCompetition(edition?.competition_id)
  const { data: membership } = useMyMembership(competition?.league_id)
  const { data: participants, isLoading: loadingParticipants } = useEditionParticipants(editionId)
  const { data: myParticipant } = useMyEditionParticipant(editionId)
  const { data: matches, isLoading: loadingMatches } = useEditionMatches(editionId)
  const { data: crestRequests } = useCrestChangeRequests(editionId)
  const invalidate = useInvalidateEdition(editionId)

  const isAdmin = membership?.role === 'owner' || membership?.role === 'admin'

  if (loadingEdition || !edition || !competition) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  const isKnockout = competition.preset_id === 'mata-mata-simples'

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <AppHeader title={`${competition.name} · Edição ${edition.number}`} backTo={`/campeonatos/${competition.id}`} />
      <div className="grid gap-6 px-4 py-6">
        {edition.status === 'upcoming' ? (
          <>
            {!myParticipant && membership?.status === 'active' && (
              <JoinEditionForm
                onSubmit={async (values) => {
                  await joinEdition(editionId, user!.id, values.teamName, values.primaryColor)
                  invalidate()
                }}
              />
            )}

            {loadingParticipants || !participants ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : (
              <EditionParticipantsPanel
                edition={edition}
                participants={participants}
                presetId={competition.preset_id}
                currentUserId={user?.id}
                isAdmin={isAdmin}
                onChanged={invalidate}
              />
            )}
          </>
        ) : (
          <>
            {isAdmin && crestRequests && crestRequests.length > 0 && user && (
              <CrestChangeRequestsPanel requests={crestRequests} adminId={user.id} onChanged={invalidate} />
            )}

            {loadingMatches || !matches ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : (
              <MatchList
                matches={matches}
                isKnockout={isKnockout}
                isAdmin={isAdmin}
                editionId={editionId}
                roundDeadlineDays={edition.round_deadline_days}
                onChanged={invalidate}
              />
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
