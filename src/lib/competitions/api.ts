import { supabase } from '#/lib/supabase/client'
import {
  builtInPresets,
  generateFirstRoundPairings,
  generateRoundRobinSchedule,
  generateSwissRoundPairings,
  computeStandings,
  pairKey,
} from '#/lib/competition-engine'
import type { Preset } from '#/lib/competition-engine/types'
import { finishedMatches } from '#/lib/competitions/stats'
import type { TablesUpdate } from '#/lib/supabase/types'

export async function createCompetition(input: {
  leagueId: string
  name: string
  presetId: string
  createdBy: string
}) {
  const { data, error } = await supabase
    .from('competitions')
    .insert({
      league_id: input.leagueId,
      name: input.name,
      preset_id: input.presetId,
      created_by: input.createdBy,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCompetition(competitionId: string) {
  const { error } = await supabase.from('competitions').delete().eq('id', competitionId)
  if (error) {
    // 23503 = violação de FK - acontece quando alguma edição desse campeonato
    // já teve um campeão enviado ao Mundial (mundial_slots.edition_id não
    // tem cascade de propósito, pra preservar o histórico do Mundial mesmo
    // se o campeonato original for apagado).
    if (error.code === '23503') {
      throw new Error('Esse campeonato tem uma edição com campeão registrado no Mundial e não pode ser apagado.')
    }
    throw error
  }
}

export async function createEdition(competitionId: string, number: number) {
  const { data, error } = await supabase
    .from('editions')
    .insert({ competition_id: competitionId, number })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function joinEdition(editionId: string, userId: string, teamName: string, primaryColor: string) {
  const { data, error } = await supabase
    .from('edition_participants')
    .insert({ edition_id: editionId, user_id: userId, team_name: teamName, primary_color: primaryColor })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateParticipant(
  id: string,
  updates: { teamName?: string; primaryColor?: string; crestUrl?: string },
) {
  const payload: TablesUpdate<'edition_participants'> = {}
  if (updates.teamName !== undefined) payload.team_name = updates.teamName
  if (updates.primaryColor !== undefined) payload.primary_color = updates.primaryColor
  if (updates.crestUrl !== undefined) payload.crest_url = updates.crestUrl

  const { error } = await supabase.from('edition_participants').update(payload).eq('id', id)
  if (error) throw error
}

export async function removeParticipant(id: string) {
  const { error } = await supabase.from('edition_participants').delete().eq('id', id)
  if (error) throw error
}

export async function requestCrestChange(editionParticipantId: string, requestedCrestUrl: string) {
  const { error } = await supabase
    .from('crest_change_requests')
    .insert({ edition_participant_id: editionParticipantId, requested_crest_url: requestedCrestUrl })
  if (error) throw error
}

export async function resolveCrestChange(
  id: string,
  status: 'approved' | 'rejected',
  adminId: string,
  adminNote?: string,
) {
  const { error } = await supabase
    .from('crest_change_requests')
    .update({ status, admin_note: adminNote || null, resolved_at: new Date().toISOString(), resolved_by: adminId })
    .eq('id', id)
  if (error) throw error
}

const ROUND_DEADLINE_MS = 24 * 60 * 60 * 1000

// Gera o calendário (ou a 1a rodada do mata-mata, com byes já resolvidos
// como partidas "confirmed" de um lado só) e passa a edição pra
// in_progress. Quem monta o calendário é o motor de regras (TS puro);
// aqui só gravamos o resultado no banco.
export async function startEdition(
  edition: { id: string; roundDeadlineDays: number },
  presetId: string,
  participantIds: string[],
) {
  const preset = builtInPresets.find((p) => p.id === presetId)
  if (!preset) throw new Error('preset_not_found')
  const stage = preset.stages[0]
  const startedAt = new Date()

  const deadlineFor = (round: number) =>
    new Date(startedAt.getTime() + round * edition.roundDeadlineDays * ROUND_DEADLINE_MS).toISOString()

  // Todas as linhas precisam das MESMAS chaves - o PostgREST monta um
  // insert em lote com uma coluna só por chave presente em QUALQUER
  // linha, e preenche com null quem não tiver a chave. Como "status" é
  // not null, uma linha sem o campo vira null e quebra o insert inteiro.
  type Row = {
    edition_id: string
    round: number
    home_participant_id: string | null
    away_participant_id: string | null
    deadline_at: string | null
    status: string
    confirmed_at: string | null
  }

  let rows: Row[]

  if (stage.kind === 'round_robin') {
    const schedule = generateRoundRobinSchedule(participantIds, stage.doubleRound)
    rows = schedule.map((m) => ({
      edition_id: edition.id,
      round: m.round,
      home_participant_id: m.homeParticipantId,
      away_participant_id: m.awayParticipantId,
      deadline_at: deadlineFor(m.round),
      status: 'scheduled',
      confirmed_at: null,
    }))
  } else if (stage.kind === 'swiss') {
    const pairings = generateSwissRoundPairings(participantIds, new Set(), new Map(), 1, new Set())
    rows = pairings.map((pairing) => {
      const isBye = pairing.participantB === null
      return {
        edition_id: edition.id,
        round: 1,
        home_participant_id: pairing.homeIsA ? pairing.participantA : pairing.participantB,
        away_participant_id: pairing.homeIsA ? pairing.participantB : pairing.participantA,
        deadline_at: isBye ? null : deadlineFor(1),
        status: isBye ? 'confirmed' : 'scheduled',
        confirmed_at: isBye ? startedAt.toISOString() : null,
      }
    })
  } else {
    const pairings = generateFirstRoundPairings(participantIds)
    rows = pairings.map((pairing) => {
      const isBye = pairing.participantA === null || pairing.participantB === null
      return {
        edition_id: edition.id,
        round: 1,
        home_participant_id: pairing.participantA,
        away_participant_id: pairing.participantB,
        deadline_at: isBye ? null : deadlineFor(1),
        status: isBye ? 'confirmed' : 'scheduled',
        confirmed_at: isBye ? startedAt.toISOString() : null,
      }
    })
  }

  const { error: insertError } = await supabase.from('matches').insert(rows)
  if (insertError) throw insertError

  const { error: updateError } = await supabase
    .from('editions')
    .update({ status: 'in_progress', started_at: startedAt.toISOString() })
    .eq('id', edition.id)
  if (updateError) throw updateError
}

// Só usado no mata-mata: depois que todas as partidas da rodada atual
// estão decididas (confirmadas, WO ou bye), monta a próxima rodada com
// os vencedores. Termina quando sobra 1 vencedor (não gera nova rodada).
export async function advanceKnockoutRound(editionId: string, roundDeadlineDays: number) {
  const { data: edition, error: editionError } = await supabase
    .from('editions')
    .select('started_at')
    .eq('id', editionId)
    .single()
  if (editionError) throw editionError

  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .eq('edition_id', editionId)
    .order('round', { ascending: false })
    .limit(1000)
  if (matchesError) throw matchesError
  if (matches.length === 0) throw new Error('no_matches')

  const currentRound = matches.reduce((max, m) => Math.max(max, m.round), 0)
  const roundMatches = matches.filter((m) => m.round === currentRound)

  const unresolved = roundMatches.filter((m) => m.status !== 'confirmed' && m.status !== 'wo')
  if (unresolved.length > 0) throw new Error('round_not_finished')

  const winners = roundMatches.map((m) => {
    if (m.home_participant_id === null) return m.away_participant_id
    if (m.away_participant_id === null) return m.home_participant_id
    if (m.status === 'wo') return m.wo_winner_participant_id
    return (m.home_goals ?? 0) > (m.away_goals ?? 0) ? m.home_participant_id : m.away_participant_id
  })

  if (winners.length === 1) return { finished: true as const }

  const nextRound = currentRound + 1
  const startedAt = edition.started_at ? new Date(edition.started_at) : new Date()
  const deadline = new Date(startedAt.getTime() + nextRound * roundDeadlineDays * ROUND_DEADLINE_MS).toISOString()

  const rows = []
  for (let i = 0; i < winners.length; i += 2) {
    rows.push({
      edition_id: editionId,
      round: nextRound,
      home_participant_id: winners[i],
      away_participant_id: winners[i + 1] ?? null,
      deadline_at: deadline,
    })
  }

  const { error: insertError } = await supabase.from('matches').insert(rows)
  if (insertError) throw insertError

  return { finished: false as const }
}

// Só usado no formato suíço: quando a rodada atual termina, reclassifica
// pela tabela até ali (pontos corridos) e pareia a próxima rodada evitando
// adversários repetidos, balanceando mandante/fora. Termina sem gerar nova
// rodada quando já rodou o número de rodadas do preset.
export async function advanceSwissRound(editionId: string, roundDeadlineDays: number, preset: Preset) {
  const stage = preset.stages[0]
  if (stage.kind !== 'swiss') throw new Error('not_a_swiss_stage')

  const { data: edition, error: editionError } = await supabase
    .from('editions')
    .select('started_at')
    .eq('id', editionId)
    .single()
  if (editionError) throw editionError

  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .eq('edition_id', editionId)
    .order('round', { ascending: false })
    .limit(1000)
  if (matchesError) throw matchesError
  if (matches.length === 0) throw new Error('no_matches')

  const currentRound = matches.reduce((max, m) => Math.max(max, m.round), 0)
  const roundMatches = matches.filter((m) => m.round === currentRound)

  const unresolved = roundMatches.filter((m) => m.status !== 'confirmed' && m.status !== 'wo')
  if (unresolved.length > 0) throw new Error('round_not_finished')

  if (currentRound >= stage.rounds) return { finished: true as const }

  const participantIds = Array.from(
    new Set(matches.flatMap((m) => [m.home_participant_id, m.away_participant_id]).filter((id): id is string => id !== null)),
  )

  const standings = computeStandings(participantIds, finishedMatches(matches), {
    pointsSystem: stage.pointsSystem,
    tiebreakCriteria: stage.tiebreakCriteria,
    headToHeadOnlyForPairs: stage.headToHeadOnlyForPairs,
  })
  const standingsOrder = standings.map((row) => row.participantId)

  const playedPairs = new Set<string>()
  const homeCounts = new Map<string, number>()
  const byeHistory = new Set<string>()
  for (const m of matches) {
    if (m.home_participant_id === null) continue
    if (m.away_participant_id === null) {
      byeHistory.add(m.home_participant_id)
    } else {
      homeCounts.set(m.home_participant_id, (homeCounts.get(m.home_participant_id) ?? 0) + 1)
      playedPairs.add(pairKey(m.home_participant_id, m.away_participant_id))
    }
  }

  const nextRound = currentRound + 1
  const startedAt = edition.started_at ? new Date(edition.started_at) : new Date()
  const deadline = new Date(startedAt.getTime() + nextRound * roundDeadlineDays * ROUND_DEADLINE_MS).toISOString()

  const pairings = generateSwissRoundPairings(standingsOrder, playedPairs, homeCounts, nextRound, byeHistory)
  const rows = pairings.map((pairing) => {
    const isBye = pairing.participantB === null
    return {
      edition_id: editionId,
      round: nextRound,
      home_participant_id: pairing.homeIsA ? pairing.participantA : pairing.participantB,
      away_participant_id: pairing.homeIsA ? pairing.participantB : pairing.participantA,
      deadline_at: isBye ? null : deadline,
      status: isBye ? 'confirmed' : 'scheduled',
      confirmed_at: isBye ? new Date().toISOString() : null,
    }
  })

  const { error: insertError } = await supabase.from('matches').insert(rows)
  if (insertError) throw insertError

  return { finished: false as const }
}

export interface MatchEventInput {
  participantId: string
  eventType: 'goal' | 'yellow_card' | 'red_card'
  athleteName: string
  assistAthleteName?: string
}

export async function submitMatchReport(input: {
  matchId: string
  homeGoals: number
  awayGoals: number
  homeRedCards: number
  awayRedCards: number
  homeYellowCards: number
  awayYellowCards: number
  screenshotPath: string
  events: MatchEventInput[]
}) {
  const { data, error } = await supabase.rpc('submit_match_report', {
    p_match_id: input.matchId,
    p_home_goals: input.homeGoals,
    p_away_goals: input.awayGoals,
    p_home_red_cards: input.homeRedCards,
    p_away_red_cards: input.awayRedCards,
    p_home_yellow_cards: input.homeYellowCards,
    p_away_yellow_cards: input.awayYellowCards,
    p_screenshot_path: input.screenshotPath,
    p_events: input.events.map((e) => ({
      participant_id: e.participantId,
      event_type: e.eventType,
      athlete_name: e.athleteName,
      assist_athlete_name: e.assistAthleteName ?? '',
    })),
  })
  if (error) throw error
  return data
}

export async function confirmMatchReport(matchId: string) {
  const { data, error } = await supabase.rpc('confirm_match_report', { p_match_id: matchId })
  if (error) throw error
  return data
}

export async function resolveContestedMatch(matchId: string, homeGoals: number, awayGoals: number) {
  const { data, error } = await supabase.rpc('resolve_contested_match', {
    p_match_id: matchId,
    p_home_goals: homeGoals,
    p_away_goals: awayGoals,
  })
  if (error) throw error
  return data
}

export async function applyMatchWo(matchId: string, winnerParticipantId: string) {
  const { data, error } = await supabase.rpc('apply_match_wo', {
    p_match_id: matchId,
    p_winner_participant_id: winnerParticipantId,
  })
  if (error) throw error
  return data
}

export async function closeEdition(
  editionId: string,
  finalPositions: { participantId: string; finalPosition: number }[],
  awards: { awardType: string; participantId: string; athleteName?: string; value?: number }[],
) {
  const { error } = await supabase.rpc('close_edition', {
    p_edition_id: editionId,
    p_final_positions: finalPositions.map((p) => ({
      participant_id: p.participantId,
      final_position: p.finalPosition,
    })),
    p_awards: awards.map((a) => ({
      award_type: a.awardType,
      participant_id: a.participantId,
      athlete_name: a.athleteName ?? null,
      value: a.value ?? null,
    })),
  })
  if (error) throw error
}
