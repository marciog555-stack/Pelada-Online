import { supabase } from '#/lib/supabase/client'
import { builtInPresets, generateFirstRoundPairings, generateRoundRobinSchedule } from '#/lib/competition-engine'
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
