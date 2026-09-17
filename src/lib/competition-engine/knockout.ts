export interface KnockoutPairing {
  round: number
  slot: number
  participantA: string | null
  participantB: string | null
}

export function nextPowerOfTwo(n: number): number {
  let p = 1
  while (p < n) p *= 2
  return p
}

export function bracketSize(participantCount: number): number {
  return nextPowerOfTwo(Math.max(participantCount, 1))
}

export function totalRounds(participantCount: number): number {
  return Math.log2(bracketSize(participantCount))
}

// Ordem clássica de chaveamento (seed 1 nunca encontra o seed 2 antes da
// final): seedPositions(2n) intercala seedPositions(n) com seu espelho.
function seedPositions(size: number): number[] {
  if (size === 1) return [1]
  const half = seedPositions(size / 2)
  const result: number[] = []
  for (const seed of half) result.push(seed, size + 1 - seed)
  return result
}

// `seeds` é a lista de participantes em ordem de força/prioridade (seed 1
// primeiro). Quem não é potência de 2 sobra como posição vazia (bye): os
// seeds mais fortes avançam direto pra rodada 2, sem jogar a rodada 1.
export function generateFirstRoundPairings(seeds: string[]): KnockoutPairing[] {
  const size = bracketSize(seeds.length)
  if (size <= 1) return []

  const positions = seedPositions(size)
  const pairings: KnockoutPairing[] = []

  for (let i = 0; i < size; i += 2) {
    const seedA = positions[i]
    const seedB = positions[i + 1]
    pairings.push({
      round: 1,
      slot: i / 2,
      participantA: seedA <= seeds.length ? seeds[seedA - 1] : null,
      participantB: seedB <= seeds.length ? seeds[seedB - 1] : null,
    })
  }

  return pairings
}

export function isBye(pairing: KnockoutPairing): boolean {
  return pairing.participantA === null || pairing.participantB === null
}

// Quem tem bye avança sem jogar; senão precisa do vencedor informado.
export function winnerOf(pairing: KnockoutPairing, winner?: string | null): string | null {
  if (pairing.participantA === null) return pairing.participantB
  if (pairing.participantB === null) return pairing.participantA
  return winner ?? null
}

export function nextRoundPairings(currentRound: KnockoutPairing[], winners: (string | null)[]): KnockoutPairing[] {
  const round = currentRound[0].round + 1
  const pairings: KnockoutPairing[] = []
  for (let i = 0; i < winners.length; i += 2) {
    pairings.push({
      round,
      slot: i / 2,
      participantA: winners[i] ?? null,
      participantB: winners[i + 1] ?? null,
    })
  }
  return pairings
}
