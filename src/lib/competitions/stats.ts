import { bracketSize, computeStandings } from '#/lib/competition-engine'
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

function winnerOf(m: Match): string | null {
  if (m.home_participant_id === null || m.away_participant_id === null) return null
  if (m.status === 'wo') return m.wo_winner_participant_id
  return (m.home_goals ?? 0) > (m.away_goals ?? 0) ? m.home_participant_id : m.away_participant_id
}

// Colocação padrão de chave eliminatória: campeão=1, vice=2, semifinalistas
// eliminados=3 (empatados), quartas=5 (empatados), etc. - tamanho da chave
// dividido por 2^rodada, +1. Byes (só um lado presente) não eliminam
// ninguém, então ficam de fora.
export function computeKnockoutFinalPositions(participantIds: string[], matches: Match[]): Map<string, number> {
  const positions = new Map<string, number>()
  const size = bracketSize(participantIds.length)
  const decided = matches.filter(
    (m) => FINISHED_STATUSES.has(m.status) && m.home_participant_id !== null && m.away_participant_id !== null,
  )
  if (decided.length === 0) return positions

  const lastRound = Math.max(...decided.map((m) => m.round))

  for (const m of decided) {
    const winner = winnerOf(m)
    if (!winner) continue
    const loser = winner === m.home_participant_id ? m.away_participant_id! : m.home_participant_id!

    if (m.round === lastRound) {
      positions.set(winner, 1)
      positions.set(loser, 2)
    } else {
      positions.set(loser, size / 2 ** m.round + 1)
    }
  }

  return positions
}

export interface EditionAwardInput {
  awardType: 'champion' | 'runner_up' | 'top_scorer' | 'best_defense'
  participantId: string
  athleteName?: string
  value?: number
}

export interface EditionClosure {
  finalPositions: { participantId: string; finalPosition: number }[]
  awards: EditionAwardInput[]
}

// Monta tudo que close_edition precisa gravar: a colocação final de cada
// participante e as premiações automáticas (campeão, vice, artilheiro(s)
// da edição e, só em pontos corridos, defesa menos vazada). Empates nos
// prêmios de artilharia/defesa premiam todo mundo empatado.
export function buildEditionClosure(
  isKnockout: boolean,
  participantIds: string[],
  matches: Match[],
  events: MatchEvent[],
  preset: Preset,
): EditionClosure {
  const awards: EditionAwardInput[] = []
  let finalPositions: { participantId: string; finalPosition: number }[]
  let championId: string | undefined
  let runnerUpId: string | undefined

  if (isKnockout) {
    const positions = computeKnockoutFinalPositions(participantIds, matches)
    finalPositions = participantIds
      .filter((id) => positions.has(id))
      .map((id) => ({ participantId: id, finalPosition: positions.get(id)! }))
    championId = participantIds.find((id) => positions.get(id) === 1)
    runnerUpId = participantIds.find((id) => positions.get(id) === 2)
  } else {
    const standings = computeEditionStandings(participantIds, matches, preset) ?? []
    finalPositions = standings.map((row) => ({ participantId: row.participantId, finalPosition: row.position }))
    championId = standings[0]?.participantId
    runnerUpId = standings[1]?.participantId

    const playedRows = standings.filter((row) => row.played > 0)
    if (playedRows.length > 0) {
      const minConceded = Math.min(...playedRows.map((row) => row.goalsAgainst))
      for (const row of playedRows.filter((r) => r.goalsAgainst === minConceded)) {
        awards.push({ awardType: 'best_defense', participantId: row.participantId, value: minConceded })
      }
    }
  }

  if (championId) awards.push({ awardType: 'champion', participantId: championId })
  if (runnerUpId) awards.push({ awardType: 'runner_up', participantId: runnerUpId })

  const scorers = computeEditionScorers(events)
  const maxGoals = scorers[0]?.goals ?? 0
  if (maxGoals > 0) {
    for (const scorer of scorers.filter((s) => s.goals === maxGoals)) {
      awards.push({
        awardType: 'top_scorer',
        participantId: scorer.participantId,
        athleteName: scorer.athleteName,
        value: scorer.goals,
      })
    }
  }

  return { finalPositions, awards }
}
