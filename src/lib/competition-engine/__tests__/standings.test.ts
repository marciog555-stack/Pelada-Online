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

  it('desempata por away_wins (vitórias fora de casa)', () => {
    // A e B empatam em pontos/saldo/gols; A venceu 1 fora, B venceu 0 fora.
    const matches: MatchResult[] = [
      { id: 'm1', homeParticipantId: 'A', awayParticipantId: 'X', homeGoals: 0, awayGoals: 0 },
      { id: 'm2', homeParticipantId: 'Y', awayParticipantId: 'A', homeGoals: 0, awayGoals: 1 },
      { id: 'm3', homeParticipantId: 'B', awayParticipantId: 'X', homeGoals: 1, awayGoals: 0 },
      { id: 'm4', homeParticipantId: 'B', awayParticipantId: 'Y', homeGoals: 0, awayGoals: 0 },
    ]

    const table = computeStandings(['A', 'B', 'X', 'Y'], matches, {
      pointsSystem: points,
      tiebreakCriteria: ['away_wins'],
      headToHeadOnlyForPairs: true,
    })

    expect(table[0].participantId).toBe('A')
    expect(table[1].participantId).toBe('B')
  })

  it('desempata por away_goals_for (gols marcados fora)', () => {
    const matches: MatchResult[] = [
      { id: 'm1', homeParticipantId: 'X', awayParticipantId: 'A', homeGoals: 0, awayGoals: 3 },
      { id: 'm2', homeParticipantId: 'X', awayParticipantId: 'B', homeGoals: 0, awayGoals: 1 },
    ]

    const table = computeStandings(['A', 'B', 'X'], matches, {
      pointsSystem: points,
      tiebreakCriteria: ['away_goals_for'],
      headToHeadOnlyForPairs: true,
    })

    // Ambos com 1 jogo fora e 3 pontos (vitória) - A marcou mais fora.
    expect(table[0].participantId).toBe('A')
  })

  it('desempata por fair_play_points (menos cartões pesa mais)', () => {
    const matches: MatchResult[] = [
      {
        id: 'm1',
        homeParticipantId: 'A',
        awayParticipantId: 'X',
        homeGoals: 1,
        awayGoals: 0,
        homeYellowCards: 1,
      },
      {
        id: 'm2',
        homeParticipantId: 'B',
        awayParticipantId: 'Y',
        homeGoals: 1,
        awayGoals: 0,
        homeRedCards: 1,
      },
    ]

    const table = computeStandings(['A', 'B', 'X', 'Y'], matches, {
      pointsSystem: points,
      tiebreakCriteria: ['fair_play_points'],
      headToHeadOnlyForPairs: true,
    })

    expect(table[0].participantId).toBe('A')
    expect(table[1].participantId).toBe('B')
  })

  it('desempata por head_to_head_away_goals dentro do confronto direto', () => {
    const matches: MatchResult[] = [
      { id: 'm1', homeParticipantId: 'A', awayParticipantId: 'B', homeGoals: 1, awayGoals: 1 },
      { id: 'm2', homeParticipantId: 'B', awayParticipantId: 'A', homeGoals: 2, awayGoals: 2 },
    ]

    // Os 2 jogos empatados (2 pontos cada) - quem decide é quem marcou
    // mais fora nesse confronto: A marcou 2 fora (no m2), B marcou 1
    // fora (no m1).
    const table = computeStandings(['A', 'B'], matches, {
      pointsSystem: points,
      tiebreakCriteria: ['head_to_head_points', 'head_to_head_away_goals'],
      headToHeadOnlyForPairs: true,
    })

    expect(table.map((r) => r.participantId)).toEqual(['A', 'B'])
  })
})
