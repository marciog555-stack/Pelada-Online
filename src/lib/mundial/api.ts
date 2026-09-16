import { supabase } from '#/lib/supabase/client'
import { generateFirstRoundPairings } from '#/lib/competition-engine'

export async function createMundial(input: {
  seasonId: string
  name: string
  maxSlots: number | null
  createdBy: string
}) {
  const { data, error } = await supabase
    .from('mundials')
    .insert({
      season_id: input.seasonId,
      name: input.name,
      max_slots: input.maxSlots,
      created_by: input.createdBy,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addMundialSlot(input: {
  mundialId: string
  leagueId: string
  editionId: string
  userId: string
  teamName: string
  crestUrl: string | null
}) {
  const { error } = await supabase.from('mundial_slots').insert({
    mundial_id: input.mundialId,
    league_id: input.leagueId,
    edition_id: input.editionId,
    user_id: input.userId,
    team_name: input.teamName,
    crest_url: input.crestUrl,
  })
  if (error) throw error
}

export async function setSlotConfirmed(slotId: string, confirmed: boolean) {
  const { error } = await supabase.from('mundial_slots').update({ confirmed }).eq('id', slotId)
  if (error) throw error
}

export async function removeMundialSlot(slotId: string) {
  const { error } = await supabase.from('mundial_slots').delete().eq('id', slotId)
  if (error) throw error
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// O sorteio em si (a ordem aleatória) acontece aqui, no momento em que o
// admin confirma - a Etapa 9 só vai encenar a revelação dessa mesma
// ordem com animação, sem mudar como ela é decidida.
export async function drawMundialBracket(mundialId: string, confirmedSlotIds: string[]) {
  const seedOrder = shuffle(confirmedSlotIds)

  for (let i = 0; i < seedOrder.length; i++) {
    const { error } = await supabase
      .from('mundial_slots')
      .update({ seed: i + 1 })
      .eq('id', seedOrder[i])
    if (error) throw error
  }

  const pairings = generateFirstRoundPairings(seedOrder)
  const now = new Date().toISOString()

  // Mesmo cuidado de startEdition (Etapa 4): todas as linhas com as
  // mesmas chaves, senão o insert em lote do PostgREST preenche com null
  // quem não tiver a chave presente.
  const rows = pairings.map((pairing) => {
    const isBye = pairing.participantA === null || pairing.participantB === null
    return {
      mundial_id: mundialId,
      round: 1,
      home_slot_id: pairing.participantA,
      away_slot_id: pairing.participantB,
      status: isBye ? 'confirmed' : 'scheduled',
      wo_winner_slot_id: isBye ? (pairing.participantA ?? pairing.participantB) : null,
      resolved_at: isBye ? now : null,
    }
  })

  const { error: insertError } = await supabase.from('mundial_matches').insert(rows)
  if (insertError) throw insertError

  const { error: updateError } = await supabase
    .from('mundials')
    .update({ status: 'in_progress', started_at: now })
    .eq('id', mundialId)
  if (updateError) throw updateError
}

export async function setMundialMatchResult(
  matchId: string,
  homeGoals: number,
  awayGoals: number,
  resolvedBy: string,
) {
  const { error } = await supabase
    .from('mundial_matches')
    .update({
      home_goals: homeGoals,
      away_goals: awayGoals,
      status: 'confirmed',
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', matchId)
  if (error) throw error
}

export async function applyMundialMatchWo(matchId: string, winnerSlotId: string, resolvedBy: string) {
  const { error } = await supabase
    .from('mundial_matches')
    .update({
      status: 'confirmed',
      wo_winner_slot_id: winnerSlotId,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', matchId)
  if (error) throw error
}

// Só usado no mata-mata: depois que todas as partidas da rodada atual
// estão decididas, monta a próxima rodada com os vencedores. Mesma
// lógica de advanceKnockoutRound (Etapa 4), adaptada pra slots do
// mundial em vez de edition_participants.
export async function advanceMundialRound(mundialId: string) {
  const { data: matches, error: matchesError } = await supabase
    .from('mundial_matches')
    .select('*')
    .eq('mundial_id', mundialId)
    .order('round', { ascending: false })
    .limit(1000)
  if (matchesError) throw matchesError
  if (matches.length === 0) throw new Error('no_matches')

  const currentRound = matches.reduce((max, m) => Math.max(max, m.round), 0)
  const roundMatches = matches.filter((m) => m.round === currentRound)

  const unresolved = roundMatches.filter((m) => m.status !== 'confirmed')
  if (unresolved.length > 0) throw new Error('round_not_finished')

  const winners = roundMatches.map((m) => {
    if (m.home_slot_id === null) return m.away_slot_id
    if (m.away_slot_id === null) return m.home_slot_id
    if (m.wo_winner_slot_id) return m.wo_winner_slot_id
    return (m.home_goals ?? 0) > (m.away_goals ?? 0) ? m.home_slot_id : m.away_slot_id
  })

  if (winners.length === 1) {
    const { error } = await supabase
      .from('mundials')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', mundialId)
    if (error) throw error
    return { finished: true as const }
  }

  const nextRound = currentRound + 1
  const rows = []
  for (let i = 0; i < winners.length; i += 2) {
    rows.push({
      mundial_id: mundialId,
      round: nextRound,
      home_slot_id: winners[i],
      away_slot_id: winners[i + 1] ?? null,
    })
  }

  const { error: insertError } = await supabase.from('mundial_matches').insert(rows)
  if (insertError) throw insertError

  return { finished: false as const }
}
