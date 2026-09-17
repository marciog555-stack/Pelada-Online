export interface ScheduledMatch {
  round: number
  homeParticipantId: string
  awayParticipantId: string
}

const BYE = '__bye__'

// Método do círculo: fixa o primeiro participante e gira os demais. Com
// número ímpar de participantes, entra um "bye" fantasma - quem cai
// contra ele simplesmente folga naquela rodada.
export function generateRoundRobinSchedule(participantIds: string[], doubleRound: boolean): ScheduledMatch[] {
  if (participantIds.length < 2) return []

  const ids = [...participantIds]
  if (ids.length % 2 !== 0) ids.push(BYE)

  const n = ids.length
  const roundsCount = n - 1
  const half = n / 2

  let current = ids
  const firstLeg: ScheduledMatch[] = []

  for (let round = 0; round < roundsCount; round++) {
    const swapHomeAway = round % 2 === 1
    for (let i = 0; i < half; i++) {
      const home = current[i]
      const away = current[n - 1 - i]
      if (home === BYE || away === BYE) continue
      firstLeg.push({
        round: round + 1,
        homeParticipantId: swapHomeAway ? away : home,
        awayParticipantId: swapHomeAway ? home : away,
      })
    }
    current = [current[0], current[n - 1], ...current.slice(1, n - 1)]
  }

  if (!doubleRound) return firstLeg

  const secondLeg: ScheduledMatch[] = firstLeg.map((match) => ({
    round: match.round + roundsCount,
    homeParticipantId: match.awayParticipantId,
    awayParticipantId: match.homeParticipantId,
  }))

  return [...firstLeg, ...secondLeg]
}
