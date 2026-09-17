import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { RequireAuth } from '#/components/auth/require-auth'
import { AppHeader } from '#/components/layout/app-header'
import { useAuth } from '#/lib/auth/auth-provider'
import { useMyMembership } from '#/hooks/use-leagues'
import {
  useMatch,
  useMatchReports,
  useMatchEvents,
  useCompetition,
  useEdition,
  useInvalidateMatch,
} from '#/hooks/use-competitions'
import { confirmMatchReport, adminConfirmMatchReport, applyMatchWo, resolveContestedMatch } from '#/lib/competitions/api'
import { MatchReportForm } from '#/components/competitions/match-report-form'
import { MatchProofImage } from '#/components/competitions/match-proof-image'
import { MatchEventsList } from '#/components/competitions/match-events-list'
import { ShareMatchResultCardButton } from '#/components/competitions/share-match-result-card-button'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/partidas/$matchId/')({ component: PartidaPage })

function PartidaPage() {
  return (
    <RequireAuth>
      <PartidaContent />
    </RequireAuth>
  )
}

function PartidaContent() {
  const { matchId } = Route.useParams()
  const { user } = useAuth()
  const { data: match, isLoading: loadingMatch } = useMatch(matchId)
  const { data: reports } = useMatchReports(matchId)
  const { data: events } = useMatchEvents(matchId)
  const { data: edition } = useEdition(match?.edition_id)
  const { data: competition } = useCompetition(edition?.competition_id)
  const { data: membership } = useMyMembership(competition?.league_id)
  const invalidate = useInvalidateMatch(matchId)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (loadingMatch || !match) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  const isAdmin = membership?.role === 'owner' || membership?.role === 'admin'
  const isHomePlayer = match.home?.user_id === user?.id
  const isAwayPlayer = match.away?.user_id === user?.id
  const isPlayer = isHomePlayer || isAwayPlayer
  const iAmReporter = match.reported_by === user?.id

  const latestReport = reports?.[0]

  async function runAction(fn: () => Promise<unknown>) {
    setBusy(true)
    setActionError(null)
    try {
      await fn()
      invalidate()
    } catch {
      setActionError('Não foi possível concluir a ação. Tente de novo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-md pb-10">
      <AppHeader title="Partida" backTo={edition ? `/edicoes/${edition.id}` : '/ligas'} />
      <div className="grid gap-5 px-4 py-6">
        <div className="grid gap-2 text-center">
          <div className="flex items-center justify-center gap-4">
            <TeamHeader side={match.home} />
            <p className="font-display text-3xl tabular-nums">
              {match.home_goals !== null && match.away_goals !== null
                ? `${match.home_goals} - ${match.away_goals}`
                : 'vs'}
            </p>
            <TeamHeader side={match.away} />
          </div>
          <Badge
            variant={STATUS_VARIANTS[match.status] ?? 'outline'}
            className="justify-self-center"
          >
            {STATUS_LABELS[match.status] ?? match.status}
          </Badge>
        </div>

        {(match.status === 'confirmed' || match.status === 'wo') &&
          match.home &&
          match.away &&
          competition &&
          edition &&
          match.home_goals !== null &&
          match.away_goals !== null && (
            <ShareMatchResultCardButton
              competitionName={competition.name}
              editionNumber={edition.number}
              home={match.home}
              away={match.away}
              homeGoals={match.home_goals}
              awayGoals={match.away_goals}
            />
          )}

        {match.status === 'scheduled' && (
          <Alert>
            <AlertDescription>
              Combinem antes de jogar: duração normal, sem prorrogação nem pênaltis (fase de pontos corridos ou
              mata-mata de jogo único). Se cair a conexão, replay o confronto.
            </AlertDescription>
          </Alert>
        )}

        {actionError && (
          <Alert variant="destructive">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {events && events.length > 0 && (
          <>
            <MatchEventsList events={events} home={match.home} away={match.away} />
            <Separator />
          </>
        )}

        {isPlayer && (match.status === 'scheduled' || (match.status === 'pending_confirmation' && !iAmReporter)) && (
          <>
            {match.status === 'pending_confirmation' && latestReport && (
              <div className="grid gap-3">
                <p className="text-sm text-muted-foreground">
                  O adversário lançou {latestReport.home_goals} x {latestReport.away_goals}. Confirme se bate ou
                  conteste enviando sua própria versão abaixo.
                </p>
                <MatchProofImage path={latestReport.screenshot_path} />
                <Button disabled={busy} onClick={() => runAction(() => confirmMatchReport(matchId))}>
                  Confirmar resultado
                </Button>
              </div>
            )}

            {match.home && match.away && (
              <MatchReportForm
                matchId={matchId}
                home={match.home}
                away={match.away}
                onSubmitted={invalidate}
              />
            )}
          </>
        )}

        {match.status === 'pending_confirmation' && iAmReporter && (
          <p className="text-center text-sm text-muted-foreground">
            Aguardando o adversário confirmar ou contestar o resultado.
          </p>
        )}

        {isAdmin && match.status === 'pending_confirmation' && (
          <div className="grid gap-2 rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Confirmar como admin</p>
            <p className="text-xs text-muted-foreground">
              {latestReport
                ? `Resultado lançado: ${latestReport.home_goals} x ${latestReport.away_goals}. `
                : ''}
              Se o adversário demorar pra confirmar, você pode confirmar esse placar direto (sem esperar as 12h
              automáticas).
            </p>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => runAction(() => adminConfirmMatchReport(matchId))}
            >
              Confirmar resultado (admin)
            </Button>
          </div>
        )}

        {match.status === 'contested' && reports && (
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">Contestado - o admin da liga vai decidir vendo os prints.</p>
            {reports.map((report) => (
              <div key={report.id} className="grid gap-2 rounded-lg border border-border p-3">
                <p className="text-sm font-medium">
                  {report.home_goals} x {report.away_goals}{' '}
                  <span className="text-muted-foreground">({report.kind === 'dispute' ? 'contestação' : 'lançamento'})</span>
                </p>
                <MatchProofImage path={report.screenshot_path} />
              </div>
            ))}

            {isAdmin && match.home && match.away && (
              <ResolveContestedForm
                matchId={matchId}
                home={match.home}
                away={match.away}
                busy={busy}
                onResolve={(h, a) => runAction(() => resolveContestedMatch(matchId, h, a))}
              />
            )}
          </div>
        )}

        {isAdmin && match.status !== 'confirmed' && match.status !== 'wo' && match.home && match.away && (
          <div className="grid gap-2 rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Aplicar W.O.</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => runAction(() => applyMatchWo(matchId, match.home!.id))}
              >
                {match.home.team_name} venceu
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => runAction(() => applyMatchWo(matchId, match.away!.id))}
              >
                {match.away.team_name} venceu
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  pending_confirmation: 'Aguardando confirmação',
  contested: 'Contestado',
  confirmed: 'Confirmado',
  wo: 'W.O.',
}

const STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'destructive' | 'outline'> = {
  scheduled: 'outline',
  pending_confirmation: 'warning',
  contested: 'destructive',
  confirmed: 'success',
  wo: 'destructive',
}

function TeamHeader({ side }: { side: { team_name: string; crest_url: string | null } | null | undefined }) {
  if (!side) return <p className="flex-1 text-sm text-muted-foreground">Folga</p>
  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      {side.crest_url ? (
        <img src={side.crest_url} alt={side.team_name} className="size-12 rounded-full object-cover" />
      ) : (
        <div className="size-12 rounded-full bg-secondary" />
      )}
      <p className="max-w-24 truncate text-xs">{side.team_name}</p>
    </div>
  )
}

function ResolveContestedForm({
  home,
  away,
  busy,
  onResolve,
}: {
  matchId: string
  home: { team_name: string }
  away: { team_name: string }
  busy: boolean
  onResolve: (homeGoals: number, awayGoals: number) => void
}) {
  const [homeGoals, setHomeGoals] = useState(0)
  const [awayGoals, setAwayGoals] = useState(0)

  return (
    <div className="grid gap-2 rounded-lg border border-border p-3">
      <p className="text-sm font-medium">Decidir placar final</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={homeGoals}
          onChange={(e) => setHomeGoals(Number(e.target.value))}
          className="w-16 rounded-md border border-input bg-transparent px-2 py-1 text-center"
        />
        <span className="text-sm text-muted-foreground">{home.team_name}</span>
        <span className="mx-2">x</span>
        <input
          type="number"
          min={0}
          value={awayGoals}
          onChange={(e) => setAwayGoals(Number(e.target.value))}
          className="w-16 rounded-md border border-input bg-transparent px-2 py-1 text-center"
        />
        <span className="text-sm text-muted-foreground">{away.team_name}</span>
      </div>
      <Button disabled={busy} onClick={() => onResolve(homeGoals, awayGoals)}>
        Confirmar decisão
      </Button>
    </div>
  )
}
