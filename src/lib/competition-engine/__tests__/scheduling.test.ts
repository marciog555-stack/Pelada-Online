import { describe, expect, it } from 'vitest'
import { generateRoundRobinSchedule } from '../scheduling'

function pairs(n: number) {
  return (n * (n - 1)) / 2
}

describe('generateRoundRobinSchedule', () => {
  it.each([4, 5, 6, 7, 20])('turno único com %i participantes: cada par se enfrenta uma vez', (n) => {
    const ids = Array.from({ length: n }, (_, i) => `T${i + 1}`)
    const schedule = generateRoundRobinSchedule(ids, false)

    expect(schedule).toHaveLength(pairs(n))

    const seenPairs = new Set<string>()
    for (const match of schedule) {
      const key = [match.homeParticipantId, match.awayParticipantId].sort().join('-')
      expect(seenPairs.has(key)).toBe(false)
      seenPairs.add(key)
    }
  })

  it('ninguém joga duas vezes na mesma rodada', () => {
    const ids = Array.from({ length: 8 }, (_, i) => `T${i + 1}`)
    const schedule = generateRoundRobinSchedule(ids, false)

    const byRound = new Map<number, string[]>()
    for (const match of schedule) {
      const list = byRound.get(match.round) ?? []
      list.push(match.homeParticipantId, match.awayParticipantId)
      byRound.set(match.round, list)
    }

    for (const [, participants] of byRound) {
      expect(new Set(participants).size).toBe(participants.length)
    }
  })

  it('número ímpar de participantes: cada rodada tem exatamente um de folga', () => {
    const ids = Array.from({ length: 7 }, (_, i) => `T${i + 1}`)
    const schedule = generateRoundRobinSchedule(ids, false)
    const rounds = new Set(schedule.map((m) => m.round))

    for (const round of rounds) {
      const playing = schedule.filter((m) => m.round === round).flatMap((m) => [m.homeParticipantId, m.awayParticipantId])
      expect(playing).toHaveLength(6)
    }
    expect(rounds.size).toBe(7)
  })

  it('turno e returno: cada par se enfrenta duas vezes, mandos invertidos', () => {
    const ids = ['A', 'B', 'C', 'D']
    const schedule = generateRoundRobinSchedule(ids, true)

    expect(schedule).toHaveLength(pairs(4) * 2)

    const single = generateRoundRobinSchedule(ids, false)
    for (const firstLegMatch of single) {
      const reverseFixture = schedule.find(
        (m) =>
          m.homeParticipantId === firstLegMatch.awayParticipantId &&
          m.awayParticipantId === firstLegMatch.homeParticipantId,
      )
      expect(reverseFixture).toBeDefined()
    }
  })

  it('menos de 2 participantes não gera partidas', () => {
    expect(generateRoundRobinSchedule(['A'], false)).toEqual([])
    expect(generateRoundRobinSchedule([], true)).toEqual([])
  })
})
