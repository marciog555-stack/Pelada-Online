import type { MatchResult, PointsSystem, RankedStandingRow, StandingRow, TiebreakCriterionName } from './types'

export function emptyRow(participantId: string): StandingRow {
  return {
    participantId,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    awayWins: 0,
    awayGoalsFor: 0,
    redCards: 0,
    yellowCards: 0,
  }
}

// Só conta partidas onde os dois lados estão em participantIds - é assim
// que a mesma função serve tanto pra tabela geral quanto pra mini-tabela
// de confronto direto (basta filtrar quem entra em participantIds).
export function computeBaseStats(
  matches: MatchResult[],
  participantIds: string[],
  points: PointsSystem,
): Map<string, StandingRow> {
  const table = new Map<string, StandingRow>()
  for (const id of participantIds) table.set(id, emptyRow(id))

  for (const match of matches) {
    const home = table.get(match.homeParticipantId)
    const away = table.get(match.awayParticipantId)
    if (!home || !away) continue

    home.played += 1
    away.played += 1
    home.goalsFor += match.homeGoals
    home.goalsAgainst += match.awayGoals
    away.goalsFor += match.awayGoals
    away.goalsAgainst += match.homeGoals
    home.redCards += match.homeRedCards ?? 0
    away.redCards += match.awayRedCards ?? 0
    home.yellowCards += match.homeYellowCards ?? 0
    away.yellowCards += match.awayYellowCards ?? 0
    away.awayGoalsFor += match.awayGoals

    if (match.homeGoals > match.awayGoals) {
      home.wins += 1
      home.points += points.win
      away.losses += 1
      away.points += points.loss
    } else if (match.homeGoals < match.awayGoals) {
      away.wins += 1
      away.points += points.win
      away.awayWins += 1
      home.losses += 1
      home.points += points.loss
    } else {
      home.draws += 1
      away.draws += 1
      home.points += points.draw
      away.points += points.draw
    }
  }

  for (const row of table.values()) row.goalDifference = row.goalsFor - row.goalsAgainst
  return table
}

interface ResolveOptions {
  headToHeadOnlyForPairs: boolean
  random?: () => number
}

function scoreForCriterion(
  criterion: TiebreakCriterionName,
  row: StandingRow,
  h2hStats: Map<string, StandingRow> | null,
  random: () => number,
): number {
  switch (criterion) {
    case 'points':
      return row.points
    case 'wins':
      return row.wins
    case 'goal_difference':
      return row.goalDifference
    case 'goals_for':
      return row.goalsFor
    case 'fewer_red_cards':
      return -row.redCards
    case 'fewer_yellow_cards':
      return -row.yellowCards
    case 'away_wins':
      return row.awayWins
    case 'away_goals_for':
      return row.awayGoalsFor
    // Pontos de fair play: fórmula padrão (1 por amarelo, 3 por vermelho) -
    // menos é melhor, por isso o sinal invertido igual aos critérios de
    // "menos cartão" acima.
    case 'fair_play_points':
      return -(row.yellowCards + row.redCards * 3)
    case 'head_to_head_points':
      return h2hStats!.get(row.participantId)!.points
    case 'head_to_head_goal_difference':
      return h2hStats!.get(row.participantId)!.goalDifference
    case 'head_to_head_goals_for':
      return h2hStats!.get(row.participantId)!.goalsFor
    case 'head_to_head_away_goals':
      return h2hStats!.get(row.participantId)!.awayGoalsFor
    case 'draw_lots':
      return random()
  }
}

// Aplica os critérios em sequência, agrupando por igualdade e resolvendo
// só dentro de cada grupo ainda empatado - exatamente como uma tabela de
// campeonato real: o próximo critério só decide entre quem seguiu empatado.
export function resolveStandings(
  rows: StandingRow[],
  criteria: TiebreakCriterionName[],
  matches: MatchResult[],
  pointsSystem: PointsSystem,
  options: ResolveOptions,
): RankedStandingRow[] {
  const random = options.random ?? Math.random
  let groups: StandingRow[][] = [rows]

  for (const criterion of criteria) {
    const nextGroups: StandingRow[][] = []

    for (const group of groups) {
      if (group.length <= 1) {
        nextGroups.push(group)
        continue
      }

      const isHeadToHead = criterion.startsWith('head_to_head')
      if (isHeadToHead && group.length > 2 && options.headToHeadOnlyForPairs) {
        // "Confronto direto só entre dois": com 3+ empatados o critério
        // é pulado (não vira mini-tabela) e passa pro próximo da lista.
        nextGroups.push(group)
        continue
      }

      const h2hStats = isHeadToHead
        ? computeBaseStats(
            matches,
            group.map((r) => r.participantId),
            pointsSystem,
          )
        : null

      const scored = group
        .map((row) => ({ row, score: scoreForCriterion(criterion, row, h2hStats, random) }))
        .sort((a, b) => b.score - a.score)

      let cluster: StandingRow[] = []
      let clusterScore: number | null = null
      for (const { row, score } of scored) {
        if (clusterScore === null || score === clusterScore) {
          cluster.push(row)
        } else {
          nextGroups.push(cluster)
          cluster = [row]
        }
        clusterScore = score
      }
      if (cluster.length > 0) nextGroups.push(cluster)
    }

    groups = nextGroups
  }

  return groups.flat().map((row, index) => ({ ...row, position: index + 1 }))
}

export function computeStandings(
  participantIds: string[],
  matches: MatchResult[],
  config: { pointsSystem: PointsSystem; tiebreakCriteria: TiebreakCriterionName[]; headToHeadOnlyForPairs: boolean },
  options?: { random?: () => number },
): RankedStandingRow[] {
  const baseStats = computeBaseStats(matches, participantIds, config.pointsSystem)
  const rows = participantIds.map((id) => baseStats.get(id)!)

  const criteria: TiebreakCriterionName[] = ['points', ...config.tiebreakCriteria]
  if (!criteria.includes('draw_lots')) criteria.push('draw_lots')

  return resolveStandings(rows, criteria, matches, config.pointsSystem, {
    headToHeadOnlyForPairs: config.headToHeadOnlyForPairs,
    random: options?.random,
  })
}
