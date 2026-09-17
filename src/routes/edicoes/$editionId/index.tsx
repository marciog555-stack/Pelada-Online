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
  useEditionMatchEvents,
  useEditionRealtime,
  useCrestChangeRequests,
  useEditionAwards,
  useInvalidateEdition,
} from '#/hooks/use-competitions'
import { joinEdition } from '#/lib/competitions/api'
import { builtInPresets } from '#/lib/competition-engine'
import { computeEditionStandings } from '#/lib/competitions/stats'
import { EditionParticipantsPanel } from '#/components/competitions/edition-participants-panel'
import { JoinEditionForm } from '#/components/competitions/join-edition-form'
import { MatchList } from '#/components/competitions/match-list'
import { CrestChangeRequestsPanel } from '#/components/competitions/crest-change-requests-panel'
import { StandingsTable } from '#/components/competitions/standings-table'
import { PlayerStatsPanel } from '#/components/competitions/player-stats-panel'
import { EditionScorersList } from '#/components/competitions/edition-scorers-list'
import { CloseEditionButton } from '#/components/competitions/close-edition-button'
import { EditionAwardsPanel } from '#/components/competitions/edition-awards-panel'
import { Skeleton } from '#/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'

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
  const { data: events } = useEditionMatchEvents(editionId)
  const { data: crestRequests } = useCrestChangeRequests(editionId)
  const { data: awards } = useEditionAwards(editionId)
  const invalidate = useInvalidateEdition(editionId)
  useEditionRealtime(editionId)

  const isAdmin = membership?.role === 'owner' || membership?.role === 'admin'

  if (loadingEdition || !edition || !competition) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  const preset = builtInPresets.find((p) => p.id === competition.preset_id)
  const stage = preset?.stages[0]
  const participantMap = new Map((participants ?? []).map((p) => [p.id, { team_name: p.team_name, crest_url: p.crest_url }]))
  const standings = preset && matches ? computeEditionStandings(Array.from(participantMap.keys()), matches, preset) : null
  const tiebreakCriteria =
    stage?.kind === 'round_robin' || stage?.kind === 'swiss'
      ? [
          'points' as const,
          ...stage.tiebreakCriteria,
          ...(stage.tiebreakCriteria.includes('draw_lots') ? [] : ['draw_lots' as const]),
        ]
      : []

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
            {edition.status === 'completed' && awards && awards.length > 0 && (
              <EditionAwardsPanel awards={awards} />
            )}

            {isAdmin && crestRequests && crestRequests.length > 0 && user && (
              <CrestChangeRequestsPanel requests={crestRequests} adminId={user.id} onChanged={invalidate} />
            )}

            {isAdmin && edition.status === 'in_progress' && matches && preset && (
              <CloseEditionButton
                editionId={editionId}
                participantIds={Array.from(participantMap.keys())}
                matches={matches}
                events={events ?? []}
                preset={preset}
                onClosed={invalidate}
              />
            )}

            <Tabs defaultValue="jogos">
              <TabsList className="w-full">
                {standings && <TabsTrigger value="tabela">Tabela</TabsTrigger>}
                <TabsTrigger value="jogos">Jogos</TabsTrigger>
                <TabsTrigger value="artilharia">Artilharia</TabsTrigger>
                <TabsTrigger value="estatisticas">Stats</TabsTrigger>
              </TabsList>

              {standings && (
                <TabsContent value="tabela" className="pt-4">
                  <StandingsTable rows={standings} participants={participantMap} criteria={tiebreakCriteria} />
                </TabsContent>
              )}

              <TabsContent value="jogos" className="pt-4">
                {loadingMatches || !matches || !preset ? (
                  <Skeleton className="h-24 w-full rounded-xl" />
                ) : (
                  <MatchList
                    matches={matches}
                    preset={preset}
                    isAdmin={isAdmin}
                    editionId={editionId}
                    roundDeadlineDays={edition.round_deadline_days}
                    onChanged={invalidate}
                  />
                )}
              </TabsContent>

              <TabsContent value="artilharia" className="pt-4">
                <EditionScorersList events={events ?? []} participants={participantMap} />
              </TabsContent>

              <TabsContent value="estatisticas" className="pt-4">
                <PlayerStatsPanel participants={participants ?? []} matches={matches ?? []} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
