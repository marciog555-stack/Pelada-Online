-- Etapa 11: histórico de carreira, conquistas especiais e a base pro
-- compartilhamento (o card em si é montado no client, aqui só os dados).
--
-- Mesmo espírito público das RPCs de sala de troféus/temporada global
-- (Etapas 6-7): qualquer usuário autenticado pode consultar a carreira e
-- as conquistas de QUALQUER jogador (o perfil público já é assim), não só
-- as próprias - por isso os parâmetros recebem p_user_id explícito em vez
-- de usar auth.uid() implicitamente.

-- ---------------------------------------------------------------------
-- Resumo de carreira: totais cross-liga (edições disputadas, títulos,
-- aproveitamento e artilharia), a partir de partidas confirmadas/W.O. de
-- toda edição ENCERRADA em que o jogador participou.
-- ---------------------------------------------------------------------
create or replace function public.player_career_summary(p_user_id uuid)
returns table (
  editions_played bigint,
  titles bigint,
  played bigint,
  wins bigint,
  draws bigint,
  losses bigint,
  goals_for bigint,
  goals_against bigint,
  goals bigint,
  assists bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with my_participants as (
    select ep.id, ep.edition_id
    from public.edition_participants ep
    join public.editions e on e.id = ep.edition_id and e.status = 'completed'
    where ep.user_id = p_user_id
  ),
  my_matches as (
    select
      m.id as match_id,
      case when m.home_participant_id = mp.id then m.home_goals else m.away_goals end as gf,
      case when m.home_participant_id = mp.id then m.away_goals else m.home_goals end as ga
    from my_participants mp
    join public.matches m
      on (m.home_participant_id = mp.id or m.away_participant_id = mp.id)
    where m.status in ('confirmed', 'wo')
      and m.home_participant_id is not null
      and m.away_participant_id is not null
  ),
  my_events as (
    select ev.event_type
    from public.match_events ev
    join my_participants mp on mp.id = ev.participant_id
  ),
  my_assists as (
    select 1
    from public.match_events ev
    join public.matches m on m.id = ev.match_id
    where ev.assist_athlete_name is not null
      and ev.assist_athlete_name <> ''
      and ev.participant_id in (select id from my_participants)
  )
  select
    (select count(distinct edition_id) from my_participants)::bigint as editions_played,
    (select count(*) from public.edition_awards ea
       join my_participants mp on mp.id = ea.participant_id
       where ea.award_type = 'champion')::bigint as titles,
    (select count(*) from my_matches)::bigint as played,
    (select count(*) from my_matches where gf > ga)::bigint as wins,
    (select count(*) from my_matches where gf = ga)::bigint as draws,
    (select count(*) from my_matches where gf < ga)::bigint as losses,
    (select coalesce(sum(gf), 0) from my_matches)::bigint as goals_for,
    (select coalesce(sum(ga), 0) from my_matches)::bigint as goals_against,
    (select count(*) from my_events where event_type = 'goal')::bigint as goals,
    (select count(*) from my_assists)::bigint as assists;
$$;

revoke execute on function public.player_career_summary(uuid) from public, anon;
grant execute on function public.player_career_summary(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Histórico: uma linha por edição ENCERRADA em que o jogador participou,
-- mais recente primeiro.
-- ---------------------------------------------------------------------
create or replace function public.player_career_history(p_user_id uuid)
returns table (
  edition_id uuid,
  edition_number integer,
  completed_at timestamptz,
  league_id uuid,
  league_name text,
  competition_id uuid,
  competition_name text,
  team_name text,
  crest_url text,
  final_position integer,
  participant_count integer,
  is_champion boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id as edition_id,
    e.number as edition_number,
    e.completed_at,
    l.id as league_id,
    l.name as league_name,
    c.id as competition_id,
    c.name as competition_name,
    ep.team_name,
    ep.crest_url,
    ep.final_position,
    (select count(*) from public.edition_participants ep2 where ep2.edition_id = e.id)::integer as participant_count,
    exists (
      select 1 from public.edition_awards ea
      where ea.edition_id = e.id and ea.participant_id = ep.id and ea.award_type = 'champion'
    ) as is_champion
  from public.edition_participants ep
  join public.editions e on e.id = ep.edition_id and e.status = 'completed'
  join public.competitions c on c.id = e.competition_id
  join public.leagues l on l.id = c.league_id
  where ep.user_id = p_user_id
  order by e.completed_at desc nulls last;
$$;

revoke execute on function public.player_career_history(uuid) from public, anon;
grant execute on function public.player_career_history(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Conquistas especiais: uma linha por tipo de conquista já alcançada,
-- com uma contagem e a data mais recente. Tipos calculados, sem tabela
-- própria (tudo já dá pra derivar do que já existe) - a lista de tipos
-- e os rótulos/ícones em PT-BR ficam no client (src/lib/profile/achievements.ts).
-- ---------------------------------------------------------------------
create or replace function public.player_achievements(p_user_id uuid)
returns table (
  achievement_type text,
  achievement_count bigint,
  last_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with my_titles as (
    select e.id as edition_id, e.completed_at, e.competition_id, e.number
    from public.edition_awards ea
    join public.edition_participants ep on ep.id = ea.participant_id
    join public.editions e on e.id = ea.edition_id
    where ea.award_type = 'champion' and ep.user_id = p_user_id
  ),
  back_to_back_pairs as (
    select completed_at
    from (
      select
        completed_at,
        number,
        lag(number) over (partition by competition_id order by number) as prev_number
      from my_titles
    ) x
    where prev_number is not null and number = prev_number + 1
  ),
  hat_tricks as (
    select max(m.confirmed_at) as at, count(*) as cnt
    from (
      select ev.match_id, count(*) as goals
      from public.match_events ev
      join public.edition_participants ep on ep.id = ev.participant_id
      where ep.user_id = p_user_id and ev.event_type = 'goal'
      group by ev.match_id, ev.participant_id, ev.athlete_name
      having count(*) >= 3
    ) ht
    join public.matches m on m.id = ht.match_id
  ),
  my_edition_matches as (
    select
      ep.edition_id,
      case when m.home_participant_id = ep.id then m.home_goals else m.away_goals end as gf,
      case when m.home_participant_id = ep.id then m.away_goals else m.home_goals end as ga
    from public.edition_participants ep
    join public.editions e on e.id = ep.edition_id and e.status = 'completed'
    join public.matches m
      on (m.home_participant_id = ep.id or m.away_participant_id = ep.id)
      and m.status in ('confirmed', 'wo')
      and m.home_participant_id is not null
      and m.away_participant_id is not null
    where ep.user_id = p_user_id
  ),
  unbeaten_editions as (
    select em.edition_id, count(*) as played, max(e.completed_at) as at
    from my_edition_matches em
    join public.editions e on e.id = em.edition_id
    group by em.edition_id, e.completed_at
    having count(*) >= 3 and count(*) filter (where em.gf < em.ga) = 0
  ),
  mundial_final_matches as (
    select mm.*, m.status as mundial_status, m.completed_at
    from public.mundial_matches mm
    join public.mundials m on m.id = mm.mundial_id and m.status = 'completed'
    where mm.round = (select max(round) from public.mundial_matches where mundial_id = mm.mundial_id)
  ),
  mundial_titles as (
    select fm.completed_at
    from mundial_final_matches fm
    join public.mundial_slots ms on ms.id = coalesce(
      fm.wo_winner_slot_id,
      case
        when fm.home_slot_id is null then fm.away_slot_id
        when fm.away_slot_id is null then fm.home_slot_id
        when fm.home_goals > fm.away_goals then fm.home_slot_id
        else fm.away_slot_id
      end
    )
    where ms.user_id = p_user_id
  ),
  top_scorer_awards as (
    select e.completed_at
    from public.edition_awards ea
    join public.edition_participants ep on ep.id = ea.participant_id
    join public.editions e on e.id = ea.edition_id
    where ea.award_type = 'top_scorer' and ep.user_id = p_user_id
  ),
  veteran as (
    select count(distinct ep.edition_id) as cnt, max(e.completed_at) as at
    from public.edition_participants ep
    join public.editions e on e.id = ep.edition_id and e.status = 'completed'
    where ep.user_id = p_user_id
  )
  select 'champion' as achievement_type, count(*)::bigint, max(completed_at) from my_titles having count(*) > 0
  union all
  select 'back_to_back', count(*)::bigint, max(completed_at) from back_to_back_pairs having count(*) > 0
  union all
  select 'hat_trick', cnt::bigint, at from hat_tricks where cnt > 0
  union all
  select 'unbeaten_edition', count(*)::bigint, max(at) from unbeaten_editions having count(*) > 0
  union all
  select 'mundial_champion', count(*)::bigint, max(completed_at) from mundial_titles having count(*) > 0
  union all
  select 'top_scorer_award', count(*)::bigint, max(completed_at) from top_scorer_awards having count(*) > 0
  union all
  select 'veteran', cnt::bigint, at from veteran where cnt >= 10;
$$;

revoke execute on function public.player_achievements(uuid) from public, anon;
grant execute on function public.player_achievements(uuid) to authenticated;
