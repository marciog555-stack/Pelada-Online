-- Fase B do redesign: sequência de forma recente (V-E-D) e próxima
-- partida pendente, pra alimentar os novos widgets da Home com dados
-- reais (sem XP/nível/aposta/PIX fictícios). Mesmo espírito público das
-- outras RPCs de carreira (Etapa 11): qualquer usuário autenticado pode
-- consultar de qualquer jogador, com p_user_id explícito.

-- ---------------------------------------------------------------------
-- Forma recente: últimas N partidas decididas (confirmadas ou W.O.) do
-- jogador, cross-liga, mais recente primeiro - sem filtrar por edição
-- encerrada (diferente do resumo de carreira), já que aqui o interesse é
-- o desempenho atual mesmo em edições ainda em andamento.
-- ---------------------------------------------------------------------
create or replace function public.player_recent_form(p_user_id uuid, p_limit integer default 5)
returns table (
  match_id uuid,
  edition_id uuid,
  team_name text,
  opponent_team_name text,
  goals_for integer,
  goals_against integer,
  result text,
  played_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with my_participants as (
    select ep.id, ep.edition_id, ep.team_name
    from public.edition_participants ep
    where ep.user_id = p_user_id
  ),
  my_matches as (
    select
      m.id as match_id,
      m.edition_id,
      mp.team_name,
      case when m.home_participant_id = mp.id then away_ep.team_name else home_ep.team_name end as opponent_team_name,
      case when m.home_participant_id = mp.id then m.home_goals else m.away_goals end as gf,
      case when m.home_participant_id = mp.id then m.away_goals else m.home_goals end as ga,
      coalesce(m.confirmed_at, m.resolved_at) as played_at
    from my_participants mp
    join public.matches m
      on (m.home_participant_id = mp.id or m.away_participant_id = mp.id)
    join public.edition_participants home_ep on home_ep.id = m.home_participant_id
    join public.edition_participants away_ep on away_ep.id = m.away_participant_id
    where m.status in ('confirmed', 'wo')
      and m.home_goals is not null
      and m.away_goals is not null
  )
  select
    match_id,
    edition_id,
    team_name,
    opponent_team_name,
    gf as goals_for,
    ga as goals_against,
    case when gf > ga then 'V' when gf < ga then 'D' else 'E' end as result,
    played_at
  from my_matches
  order by played_at desc nulls last
  limit greatest(p_limit, 0);
$$;

revoke execute on function public.player_recent_form(uuid, integer) from public, anon;
grant execute on function public.player_recent_form(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------
-- Próxima partida pendente do jogador (aguardando ser jogada ou já
-- reportada mas ainda não confirmada), cross-liga, a mais próxima do
-- prazo primeiro - pro "destaque de partida" da Home.
-- ---------------------------------------------------------------------
create or replace function public.player_next_match(p_user_id uuid)
returns table (
  match_id uuid,
  edition_id uuid,
  competition_id uuid,
  competition_name text,
  league_id uuid,
  league_name text,
  round integer,
  status text,
  team_name text,
  opponent_team_name text,
  opponent_crest_url text,
  deadline_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with my_participants as (
    select ep.id, ep.edition_id, ep.team_name
    from public.edition_participants ep
    where ep.user_id = p_user_id
  )
  select
    m.id as match_id,
    m.edition_id,
    c.id as competition_id,
    c.name as competition_name,
    l.id as league_id,
    l.name as league_name,
    m.round,
    m.status,
    mp.team_name,
    case when m.home_participant_id = mp.id then away_ep.team_name else home_ep.team_name end as opponent_team_name,
    case when m.home_participant_id = mp.id then away_ep.crest_url else home_ep.crest_url end as opponent_crest_url,
    m.deadline_at
  from my_participants mp
  join public.matches m
    on (m.home_participant_id = mp.id or m.away_participant_id = mp.id)
  join public.edition_participants home_ep on home_ep.id = m.home_participant_id
  join public.edition_participants away_ep on away_ep.id = m.away_participant_id
  join public.editions e on e.id = m.edition_id
  join public.competitions c on c.id = e.competition_id
  join public.leagues l on l.id = c.league_id
  where m.status in ('scheduled', 'pending_confirmation')
  order by m.deadline_at asc nulls last, m.round asc
  limit 1;
$$;

revoke execute on function public.player_next_match(uuid) from public, anon;
grant execute on function public.player_next_match(uuid) to authenticated;
