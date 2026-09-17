-- Etapa 5: ranking interno e artilheiros da história da liga (agregando
-- partidas confirmadas/wo de todas as edições/campeonatos da liga).
-- home_goals/away_goals já vêm certos mesmo em W.O. (apply_match_wo grava
-- o placar padrão orientado pro lado vencedor), então não precisa de
-- tratamento especial pra esses casos aqui.

create or replace function public.league_player_stats(p_league_id uuid)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  played bigint,
  wins bigint,
  draws bigint,
  losses bigint,
  goals_for bigint,
  goals_against bigint,
  points bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with league_matches as (
    select m.*
    from public.matches m
    join public.editions e on e.id = m.edition_id
    join public.competitions c on c.id = e.competition_id
    where c.league_id = p_league_id
      and public.is_league_member(p_league_id)
      and m.status in ('confirmed', 'wo')
      and m.home_participant_id is not null
      and m.away_participant_id is not null
  ),
  sides as (
    select
      hp.user_id,
      lm.home_goals as goals_for,
      lm.away_goals as goals_against,
      (lm.home_goals > lm.away_goals) as is_win,
      (lm.home_goals = lm.away_goals) as is_draw
    from league_matches lm
    join public.edition_participants hp on hp.id = lm.home_participant_id
    union all
    select
      ap.user_id,
      lm.away_goals as goals_for,
      lm.home_goals as goals_against,
      (lm.away_goals > lm.home_goals) as is_win,
      (lm.home_goals = lm.away_goals) as is_draw
    from league_matches lm
    join public.edition_participants ap on ap.id = lm.away_participant_id
  )
  select
    pr.id as user_id,
    pr.display_name,
    pr.avatar_url,
    count(*)::bigint as played,
    count(*) filter (where s.is_win)::bigint as wins,
    count(*) filter (where s.is_draw)::bigint as draws,
    count(*) filter (where not s.is_win and not s.is_draw)::bigint as losses,
    coalesce(sum(s.goals_for), 0)::bigint as goals_for,
    coalesce(sum(s.goals_against), 0)::bigint as goals_against,
    (count(*) filter (where s.is_win) * 3 + count(*) filter (where s.is_draw))::bigint as points
  from sides s
  join public.profiles pr on pr.id = s.user_id
  group by pr.id, pr.display_name, pr.avatar_url
  order by points desc, goals_for desc, pr.display_name asc;
$$;

revoke execute on function public.league_player_stats(uuid) from public, anon;
grant execute on function public.league_player_stats(uuid) to authenticated;

-- Artilharia por atleta (nome livre dentro do time) + assistências, só de
-- partidas confirmadas (W.O. nunca tem match_events porque não passa por
-- súmula).
create or replace function public.league_top_scorers(p_league_id uuid)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  athlete_name text,
  goals bigint,
  assists bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with league_events as (
    select ev.*, ep.user_id
    from public.match_events ev
    join public.matches m on m.id = ev.match_id
    join public.editions e on e.id = m.edition_id
    join public.competitions c on c.id = e.competition_id
    join public.edition_participants ep on ep.id = ev.participant_id
    where c.league_id = p_league_id
      and public.is_league_member(p_league_id)
      and m.status = 'confirmed'
      and ev.event_type = 'goal'
  ),
  goals as (
    select user_id, athlete_name, count(*) as goals
    from league_events
    group by user_id, athlete_name
  ),
  assists as (
    select user_id, assist_athlete_name as athlete_name, count(*) as assists
    from league_events
    where assist_athlete_name is not null and assist_athlete_name <> ''
    group by user_id, assist_athlete_name
  )
  select
    pr.id as user_id,
    pr.display_name,
    pr.avatar_url,
    coalesce(g.athlete_name, a.athlete_name) as athlete_name,
    coalesce(g.goals, 0)::bigint as goals,
    coalesce(a.assists, 0)::bigint as assists
  from goals g
  full outer join assists a on a.user_id = g.user_id and a.athlete_name = g.athlete_name
  join public.profiles pr on pr.id = coalesce(g.user_id, a.user_id)
  order by goals desc, assists desc, athlete_name asc;
$$;

revoke execute on function public.league_top_scorers(uuid) from public, anon;
grant execute on function public.league_top_scorers(uuid) to authenticated;
