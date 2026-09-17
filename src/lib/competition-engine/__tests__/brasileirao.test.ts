import { describe, expect, it } from 'vitest'
import { resolveStandings, emptyRow } from '../standings'
import { brasileiraoSerieAPreset } from '../presets/brasileirao'
import type { MatchResult, RoundRobinStageConfig, StandingRow } from '../types'

const stage = brasileiraoSerieAPreset.stages[0] as RoundRobinStageConfig
const criteria = ['points', ...stage.tiebreakCriteria] as const

function row(id: string, overrides: Partial<StandingRow>): StandingRow {
  return { ...emptyRow(id), ...overrides }
}

// LCG simples só pra reproduzir o mesmo sorteio em testes - nada a ver
// com o sorteio ao vivo do Mundial (Etapa 9), que é auditado no servidor.
function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

describe('Brasileirão Série A - desempates', () => {
  it('empate duplo: decide por confronto direto', () => {
    const rows = [
      row('A', { points: 10, wins: 3, goalDifference: 5, goalsFor: 8 }),
      row('B', { points: 10, wins: 3, goalDifference: 5, goalsFor: 8 }),
      row('C', { points: 4, wins: 1, goalDifference: -2, goalsFor: 3 }),
    ]
    const matches: MatchResult[] = [
      { id: 'm1', homeParticipantId: 'A', awayParticipantId: 'B', homeGoals: 2, awayGoals: 0 },
      { id: 'm2', homeParticipantId: 'B', awayParticipantId: 'A', homeGoals: 0, awayGoals: 1 },
    ]

    const result = resolveStandings(rows, [...criteria], matches, stage.pointsSystem, {
      headToHeadOnlyForPairs: stage.headToHeadOnlyForPairs,
    })

    expect(result.map((r) => r.participantId)).toEqual(['A', 'B', 'C'])
  })

  it('empate triplo: confronto direto é ignorado (só vale entre dois) e quem decide são os cartões', () => {
    const rows = [
      row('A', { points: 7, wins: 2, goalDifference: 3, goalsFor: 6, redCards: 0 }),
      row('B', { points: 7, wins: 2, goalDifference: 3, goalsFor: 6, redCards: 1 }),
      row('C', { points: 7, wins: 2, goalDifference: 3, goalsFor: 6, redCards: 2 }),
    ]
    // Confronto direto favoreceria C (venceu A e B) se fosse aplicado -
    // mas com 3 empatados o critério deve ser pulado.
    const matches: MatchResult[] = [
      { id: 'm1', homeParticipantId: 'C', awayParticipantId: 'A', homeGoals: 2, awayGoals: 0 },
      { id: 'm2', homeParticipantId: 'C', awayParticipantId: 'B', homeGoals: 2, awayGoals: 0 },
      { id: 'm3', homeParticipantId: 'A', awayParticipantId: 'B', homeGoals: 1, awayGoals: 1 },
    ]

    const result = resolveStandings(rows, [...criteria], matches, stage.pointsSystem, {
      headToHeadOnlyForPairs: stage.headToHeadOnlyForPairs,
    })

    expect(result.map((r) => r.participantId)).toEqual(['A', 'B', 'C'])
  })

  it('empate total: só o sorteio resolve, e o resultado é reprodutível com a mesma semente', () => {
    const rows = [row('A', { points: 6, wins: 2, goalDifference: 2, goalsFor: 4 }), row('B', { points: 6, wins: 2, goalDifference: 2, goalsFor: 4 })]
    // Confronto direto também empata (um venceu cada jogo).
    const matches: MatchResult[] = [
      { id: 'm1', homeParticipantId: 'A', awayParticipantId: 'B', homeGoals: 1, awayGoals: 0 },
      { id: 'm2', homeParticipantId: 'B', awayParticipantId: 'A', homeGoals: 1, awayGoals: 0 },
    ]

    const first = resolveStandings(rows, [...criteria], matches, stage.pointsSystem, {
      headToHeadOnlyForPairs: stage.headToHeadOnlyForPairs,
      random: seededRandom(42),
    })
    const second = resolveStandings(rows, [...criteria], matches, stage.pointsSystem, {
      headToHeadOnlyForPairs: stage.headToHeadOnlyForPairs,
      random: seededRandom(42),
    })

    expect(first.map((r) => r.position)).toEqual([1, 2])
    expect(second.map((r) => r.participantId)).toEqual(first.map((r) => r.participantId))
  })
})
