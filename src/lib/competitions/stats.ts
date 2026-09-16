import { computeStandings } from '#/lib/competition-engine'
import type { MatchResult, RankedStandingRow, TiebreakCriterionName } from '#/lib/competition-engine'
import type { Preset } from '#/lib/competition-engine/types'
import type { Match, MatchEvent } from '#/hooks/use-competitions'

const FINISHED_STATUSES = new Set(['confirmed', 'wo'])

// Só entram partidas decididas com os dois lados presentes (byes de
// mata-mata ficam de fora, não fazem sentido numa tabela de pontos
// corridos nem contam como jogo pra estatística de ninguém).
export function finishedMatches(matches: Match[]): MatchResult[] {
  return matches
    .filter(
      (m) =>
        FINISHED_STATUSES.has(m.status) &&
        m.home_participant_id !== null &&
        m.away_participant_id !== null &&
        m.home_goals !== null &&
        m.away_goals !== null,
    )
    .map((m) => ({
      id: m.id,
      homeParticipantId: m.home_participant_id!,
      awayParticipantId: m.away_participant_id!,
      homeGoals: m.home_goals!,
      awayGoals: m.away_goals!,
    }))
}

export function computeEditionStandings(
  participantIds: string[],
  matches: Match[],
  preset: Preset,
): RankedStandingRow[] | null {
  const stage = preset.stages[0]
  if (stage.kind !== 'round_robin') return null

  return computeStandings(participantIds, finishedMatches(matches), {
    pointsSystem: stage.pointsSystem,
    tiebreakCriteria: stage.tiebreakCriteria,
    headToHeadOnlyForPairs: stage.headToHeadOnlyForPairs,
  })
}

export const TIEBREAK_LABELS: Record<TiebreakCriterionName, string> = {
  points: 'Pontos',
  wins: 'Número de vitórias',
  goal_difference: 'Saldo de gols',
  goals_for: 'Gols marcados',
  head_to_head_points: 'Confronto direto (pontos)',
  head_to_head_goal_difference: 'Confronto direto (saldo)',
  head_to_head_goals_for: 'Confronto direto (gols marcados)',
  fewer_red_cards: 'Menos cartões vermelhos',
  fewer_yellow_cards: 'Menos cartões amarelos',
  draw_lots: 'Sorteio',
}

export interface ParticipantStats {
  participantId: string
  played: number
  wins: number
  draws: number
  losses: number
  winRate: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  cleanSheets: number
  biggestWinMargin: number
  currentWinStreak: number
  woInFavor: number
  woAgainst: number
}

export function computeParticipantStats(participantId: string, matches: Match[]): ParticipantStats {
  const relevant = matches
    .filter(
      (m) =>
        FINISHED_STATUSES.has(m.status) &&
        (m.home_participant_id === participantId || m.away_participant_id === participantId),
    )
    .sort((a, b) => a.round - b.round)

  let wins = 0
  let draws = 0
  let losses = 0
  let goalsFor = 0
  let goalsAgainst = 0
  let cleanSheets = 0
  let biggestWinMargin = 0
  let woInFavor = 0
  let woAgainst = 0
  let currentWinStreak = 0
  let streakBroken = false

  // De trás pra frente pra sequência atual de vitórias parar no primeiro
  // jogo que não foi vitória.
  for (let i = relevant.length - 1; i >= 0; i--) {
    const m = relevant[i]
    const isHome = m.home_participant_id === participantId
    const gf = isHome ? (m.home_goals ?? 0) : (m.away_goals ?? 0)
    const ga = isHome ? (m.away_goals ?? 0) : (m.home_goals ?? 0)
    const won = gf > ga

    if (!streakBroken) {
      if (won) currentWinStreak += 1
      else streakBroken = true
    }

    goalsFor += gf
    goalsAgainst += ga
    if (ga === 0) cleanSheets += 1
    if (won) {
      wins += 1
      biggestWinMargin = Math.max(biggestWinMargin, gf - ga)
    } else if (gf === ga) {
      draws += 1
    } else {
      losses += 1
    }

    if (m.status === 'wo' && m.wo_winner_participant_id !== null) {
      if (m.wo_winner_participant_id === participantId) woInFavor += 1
      else woAgainst += 1
    }
  }

  const played = relevant.length
  return {
    participantId,
    played,
    wins,
    draws,
    losses,
    winRate: played > 0 ? (wins / played) * 100 : 0,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    cleanSheets,
    biggestWinMargin,
    currentWinStreak,
    woInFavor,
    woAgainst,
  }
}

export interface EditionScorerRow {
  participantId: string
  athleteName: string
  goals: number
  assists: number
}

// Artilharia é por atleta (nome livre dentro do time), não por time -
// mesmo padrão da RPC league_top_scorers, só que aqui já filtrado pra
// edição/campeonato atual e calculado no client (dataset pequeno).
export function computeEditionScorers(events: MatchEvent[]): EditionScorerRow[] {
  const rows = new Map<string, EditionScorerRow>()

  function rowFor(participantId: string, athleteName: string) {
    const key = `${participantId}::${athleteName}`
    let row = rows.get(key)
    if (!row) {
      row = { participantId, athleteName, goals: 0, assists: 0 }
      rows.set(key, row)
    }
    return row
  }

  for (const event of events) {
    if (event.event_type !== 'goal') continue
    rowFor(event.participant_id, event.athlete_name).goals += 1
    if (event.assist_athlete_name && event.assist_athlete_name.trim().length > 0) {
      rowFor(event.participant_id, event.assist_athlete_name).assists += 1
    }
  }

  return Array.from(rows.values()).sort((a, b) => b.goals - a.goals || b.assists - a.assists)
}
