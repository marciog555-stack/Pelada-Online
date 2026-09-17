// Pareamento suíço: cada rodada empareia adversários ainda não cruzados,
// dos mais próximos na classificação atual pros mais distantes (padrão
// "adjacent pairing" de torneios suíços). Ninguém repete adversário
// enquanto houver alguém livre pra evitar - só repete se não sobrar
// opção. Quem sobra ímpar tira bye (um só, e roda entre quem ainda não
// tirou). Casa/fora é balanceado pelo histórico de jogos em casa.

export interface SwissPairing {
  round: number
  participantA: string
  participantB: string | null
  homeIsA: boolean
}

export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

// standingsOrder: participantIds já ordenados pela classificação atual
// (melhor primeiro) - na 1a rodada, a ordem de semeadura inicial serve.
export function generateSwissRoundPairings(
  standingsOrder: string[],
  playedPairs: ReadonlySet<string>,
  homeCounts: ReadonlyMap<string, number>,
  round: number,
  byeHistory: ReadonlySet<string>,
): SwissPairing[] {
  const remaining = [...standingsOrder]
  const pairings: SwissPairing[] = []

  if (remaining.length % 2 === 1) {
    let byeIndex = remaining.length - 1
    while (byeIndex > 0 && byeHistory.has(remaining[byeIndex])) byeIndex--
    const byeParticipant = remaining.splice(byeIndex, 1)[0]
    pairings.push({ round, participantA: byeParticipant, participantB: null, homeIsA: true })
  }

  const localPlayed = new Set(playedPairs)
  const localHome = new Map(homeCounts)

  while (remaining.length > 0) {
    const a = remaining.shift()!
    let opponentIndex = remaining.findIndex((b) => !localPlayed.has(pairKey(a, b)))
    if (opponentIndex === -1) opponentIndex = 0
    const b = remaining.splice(opponentIndex, 1)[0]

    const aHome = localHome.get(a) ?? 0
    const bHome = localHome.get(b) ?? 0
    const homeIsA = aHome <= bHome

    pairings.push({ round, participantA: a, participantB: b, homeIsA })
    localPlayed.add(pairKey(a, b))
    localHome.set(homeIsA ? a : b, (localHome.get(homeIsA ? a : b) ?? 0) + 1)
  }

  return pairings
}
