import { describe, expect, it } from 'vitest'
import { generateSwissRoundPairings } from '../swiss'

describe('generateSwissRoundPairings', () => {
  it('empareia todo mundo em pares adjacentes na 1a rodada (número par)', () => {
    const pairings = generateSwissRoundPairings(['A', 'B', 'C', 'D'], new Set(), new Map(), 1, new Set())

    expect(pairings).toHaveLength(2)
    expect(pairings.every((p) => p.participantB !== null)).toBe(true)
    const allIds = pairings.flatMap((p) => [p.participantA, p.participantB])
    expect(new Set(allIds)).toEqual(new Set(['A', 'B', 'C', 'D']))
  })

  it('dá bye pra quem sobra quando o número é ímpar', () => {
    const pairings = generateSwissRoundPairings(['A', 'B', 'C'], new Set(), new Map(), 1, new Set())

    const byes = pairings.filter((p) => p.participantB === null)
    expect(byes).toHaveLength(1)
    expect(pairings).toHaveLength(2)
  })

  it('não repete adversário já cruzado enquanto houver alguém livre', () => {
    const played = new Set(['A|B'])
    const pairings = generateSwissRoundPairings(['A', 'B', 'C', 'D'], played, new Map(), 2, new Set())

    const aPairing = pairings.find((p) => p.participantA === 'A' || p.participantB === 'A')!
    const opponentOfA = aPairing.participantA === 'A' ? aPairing.participantB : aPairing.participantA
    expect(opponentOfA).not.toBe('B')
  })

  it('roda o bye pra quem ainda não tirou, mesmo estando na última posição de novo', () => {
    const byeHistory = new Set(['D'])
    const pairings = generateSwissRoundPairings(['A', 'B', 'C', 'D'], new Set(), new Map(), 3, byeHistory)
    // com 4 participantes (par) não tem bye - testa o caso ímpar abaixo
    expect(pairings.every((p) => p.participantB !== null)).toBe(true)

    const byeHistoryOdd = new Set(['C'])
    const pairingsOdd = generateSwissRoundPairings(['A', 'B', 'C'], new Set(), new Map(), 3, byeHistoryOdd)
    const bye = pairingsOdd.find((p) => p.participantB === null)!
    expect(bye.participantA).not.toBe('C')
  })

  it('equilibra mandante/visitante pelo histórico de jogos em casa', () => {
    const homeCounts = new Map([
      ['A', 3],
      ['B', 0],
    ])
    const pairings = generateSwissRoundPairings(['A', 'B'], new Set(), homeCounts, 2, new Set())

    expect(pairings).toHaveLength(1)
    expect(pairings[0].homeIsA).toBe(false)
  })

  it('mantém a mesma lista de participantes de uma rodada pra outra (ninguém some)', () => {
    const round1 = generateSwissRoundPairings(['A', 'B', 'C', 'D'], new Set(), new Map(), 1, new Set())
    const played = new Set(
      round1.filter((p) => p.participantB).map((p) => `${p.participantA}|${p.participantB}`),
    )
    // 2a rodada com a classificação reordenada (simulando resultados).
    const round2 = generateSwissRoundPairings(['C', 'A', 'D', 'B'], played, new Map(), 2, new Set())

    const allIds = round2.flatMap((p) => [p.participantA, p.participantB])
    expect(new Set(allIds)).toEqual(new Set(['A', 'B', 'C', 'D']))
  })
})
