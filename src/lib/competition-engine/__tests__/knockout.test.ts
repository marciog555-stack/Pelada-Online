import { describe, expect, it } from 'vitest'
import {
  bracketSize,
  generateFirstRoundPairings,
  isBye,
  nextRoundPairings,
  totalRounds,
  winnerOf,
} from '../knockout'

function participants(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `P${i + 1}`)
}

describe('mata-mata simples: byes automáticos', () => {
  it.each([
    [2, 2, 0],
    [3, 4, 1],
    [4, 4, 0],
    [5, 8, 3],
    [6, 8, 2],
    [7, 8, 1],
    [9, 16, 7],
  ])('%i participantes -> chave de %i, %i byes', (count, size, byes) => {
    expect(bracketSize(count)).toBe(size)

    const pairings = generateFirstRoundPairings(participants(count))
    expect(pairings).toHaveLength(size / 2)

    const byeCount = pairings.filter(isBye).length
    expect(byeCount).toBe(byes)

    // ninguém joga duas vezes na primeira rodada, e todo mundo aparece
    const seen = pairings.flatMap((p) => [p.participantA, p.participantB]).filter((p): p is string => p !== null)
    expect(new Set(seen).size).toBe(count)
  })

  it('seed 1 nunca cai contra seed 2 na primeira rodada', () => {
    const pairings = generateFirstRoundPairings(participants(8))
    const together = pairings.some(
      (p) =>
        (p.participantA === 'P1' && p.participantB === 'P2') ||
        (p.participantA === 'P2' && p.participantB === 'P1'),
    )
    expect(together).toBe(false)
  })

  it('sem participantes suficientes (1) não gera chave', () => {
    expect(generateFirstRoundPairings(['P1'])).toEqual([])
  })
})

describe('mata-mata simples: avanço de rodadas', () => {
  it('simula a chave inteira até sobrar 1 campeão, para 5 participantes', () => {
    const seeds = participants(5)
    expect(totalRounds(5)).toBe(3)

    let round = generateFirstRoundPairings(seeds)
    let champion: string | null = null
    let roundsPlayed = 0

    while (champion === null && roundsPlayed < totalRounds(5)) {
      const winners = round.map((pairing) => {
        if (isBye(pairing)) return winnerOf(pairing)
        // "joga" o confronto: o participante de menor número (mais forte) vence
        const a = Number(pairing.participantA!.slice(1))
        const b = Number(pairing.participantB!.slice(1))
        return winnerOf(pairing, a < b ? pairing.participantA : pairing.participantB)
      })
      roundsPlayed += 1
      if (winners.length === 1) {
        champion = winners[0]
      } else {
        round = nextRoundPairings(round, winners)
      }
    }

    expect(champion).toBe('P1')
  })
})
