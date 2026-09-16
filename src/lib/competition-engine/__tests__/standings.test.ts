import { describe, expect, it } from 'vitest'
import { computeBaseStats, computeStandings } from '../standings'
import type { MatchResult, PointsSystem } from '../types'

const points: PointsSystem = { win: 3, draw: 1, loss: 0 }

describe('computeBaseStats', () => {
  it('acumula pontos, gols e vitórias/fora corretamente', () => {
    const matches: MatchResult[] = [
      { id: 'm1', homeParticipantId: 'A', awayParticipantId: 'B', homeGoals: 2, awayGoals: 0 },
      { id: 'm2', homeParticipantId: 'B', awayParticipantId: 'A', homeGoals: 1, awayGoals: 1 },
      { id: 'm3', homeParticipantId: 'A', awayParticipantId: 'C', homeGoals: 0, awayGoals: 3 },
    ]

    const table = computeBaseStats(matches, ['A', 'B', 'C'], points)

    const a = table.get('A')!
    expect(a.played).toBe(3)
    expect(a.wins).toBe(1)
    expect(a.draws).toBe(1)
    expect(a.losses).toBe(1)
    expect(a.goalsFor).toBe(3)
    expect(a.goalsAgainst).toBe(4)
    expect(a.goalDifference).toBe(-1)
    expect(a.points).toBe(4)

    const c = table.get('C')!
    expect(c.wins).toBe(1)
    expect(c.awayWins).toBe(1)
    expect(c.awayGoalsFor).toBe(3)
    expect(c.points).toBe(3)
  })

  it('ignora partidas com participante fora da lista (usado nas mini-tabelas de confronto direto)', () => {
    const matches: MatchResult[] = [
      { id: 'm1', homeParticipantId: 'A', awayParticipantId: 'B', homeGoals: 1, awayGoals: 0 },
      { id: 'm2', homeParticipantId: 'A', awayParticipantId: 'C', homeGoals: 5, awayGoals: 0 },
    ]

    const table = computeBaseStats(matches, ['A', 'B'], points)
    expect(table.get('A')!.played).toBe(1)
    expect(table.get('A')!.goalsFor).toBe(1)
  })
})

describe('computeStandings', () => {
  it('ordena por pontos quando não há empate', () => {
    const matches: MatchResult[] = [
      { id: 'm1', homeParticipantId: 'A', awayParticipantId: 'B', homeGoals: 2, awayGoals: 0 },
      { id: 'm2', homeParticipantId: 'C', awayParticipantId: 'A', homeGoals: 0, awayGoals: 0 },
      { id: 'm3', homeParticipantId: 'B', awayParticipantId: 'C', homeGoals: 1, awayGoals: 1 },
    ]

    const table = computeStandings(['A', 'B', 'C'], matches, {
      pointsSystem: points,
      tiebreakCriteria: ['wins', 'goal_difference', 'goals_for'],
      headToHeadOnlyForPairs: true,
    })

    expect(table.map((r) => r.participantId)).toEqual(['A', 'C', 'B'])
    expect(table.map((r) => r.position)).toEqual([1, 2, 3])
  })
})
