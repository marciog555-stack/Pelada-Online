-- Estatísticas detalhadas da partida (posse, chutes, escanteios etc,
-- iguais ao que a tela de fim de jogo do eFootball mostra) - opcional,
-- preenchido à mão pelo jogador olhando a própria tela. Serve de base
-- pro "perfil de jogo" de cada jogador (Etapa seguinte: agregação).
create table public.match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  participant_id uuid not null references public.edition_participants (id),
  possession integer check (possession between 0 and 100),
  shots integer check (shots >= 0),
  shots_on_target integer check (shots_on_target >= 0),
  fouls integer check (fouls >= 0),
  offsides integer check (offsides >= 0),
  corners integer check (corners >= 0),
  free_kicks integer check (free_kicks >= 0),
  passes integer check (passes >= 0),
  passes_completed integer check (passes_completed >= 0),
  crosses integer check (crosses >= 0),
  interceptions integer check (interceptions >= 0),
  tackles integer check (tackles >= 0),
  saves integer check (saves >= 0),
  created_at timestamptz not null default now(),
  unique (match_id, participant_id)
);

create index idx_match_stats_match_id on public.match_stats (match_id);
create index idx_match_stats_participant_id on public.match_stats (participant_id);

alter table public.match_stats enable row level security;

create policy "match players and admins read stats"
  on public.match_stats for select
  to authenticated
  using (public.is_match_player(match_id) or public.is_league_admin(public.league_id_for_match(match_id)));

-- Sem policy de insert direto - só pela RPC abaixo (security definer),
-- igual ao padrão de match_reports/match_events.

create or replace function public.submit_match_stats(p_match_id uuid, p_home_stats jsonb, p_away_stats jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches;
begin
  select * into v_match from public.matches where id = p_match_id;
  if v_match.id is null then
    raise exception 'match_not_found';
  end if;
  if not (public.is_match_player(p_match_id) or public.is_league_admin(public.league_id_for_match(p_match_id))) then
    raise exception 'not_allowed';
  end if;
  if v_match.home_participant_id is null or v_match.away_participant_id is null then
    raise exception 'match_missing_participants';
  end if;

  if p_home_stats is not null then
    insert into public.match_stats (
      match_id, participant_id, possession, shots, shots_on_target, fouls, offsides,
      corners, free_kicks, passes, passes_completed, crosses, interceptions, tackles, saves
    ) values (
      p_match_id, v_match.home_participant_id,
      (p_home_stats ->> 'possession')::integer, (p_home_stats ->> 'shots')::integer,
      (p_home_stats ->> 'shots_on_target')::integer, (p_home_stats ->> 'fouls')::integer,
      (p_home_stats ->> 'offsides')::integer, (p_home_stats ->> 'corners')::integer,
      (p_home_stats ->> 'free_kicks')::integer, (p_home_stats ->> 'passes')::integer,
      (p_home_stats ->> 'passes_completed')::integer, (p_home_stats ->> 'crosses')::integer,
      (p_home_stats ->> 'interceptions')::integer, (p_home_stats ->> 'tackles')::integer,
      (p_home_stats ->> 'saves')::integer
    )
    on conflict (match_id, participant_id) do update set
      possession = excluded.possession, shots = excluded.shots, shots_on_target = excluded.shots_on_target,
      fouls = excluded.fouls, offsides = excluded.offsides, corners = excluded.corners,
      free_kicks = excluded.free_kicks, passes = excluded.passes, passes_completed = excluded.passes_completed,
      crosses = excluded.crosses, interceptions = excluded.interceptions, tackles = excluded.tackles,
      saves = excluded.saves;
  end if;

  if p_away_stats is not null then
    insert into public.match_stats (
      match_id, participant_id, possession, shots, shots_on_target, fouls, offsides,
      corners, free_kicks, passes, passes_completed, crosses, interceptions, tackles, saves
    ) values (
      p_match_id, v_match.away_participant_id,
      (p_away_stats ->> 'possession')::integer, (p_away_stats ->> 'shots')::integer,
      (p_away_stats ->> 'shots_on_target')::integer, (p_away_stats ->> 'fouls')::integer,
      (p_away_stats ->> 'offsides')::integer, (p_away_stats ->> 'corners')::integer,
      (p_away_stats ->> 'free_kicks')::integer, (p_away_stats ->> 'passes')::integer,
      (p_away_stats ->> 'passes_completed')::integer, (p_away_stats ->> 'crosses')::integer,
      (p_away_stats ->> 'interceptions')::integer, (p_away_stats ->> 'tackles')::integer,
      (p_away_stats ->> 'saves')::integer
    )
    on conflict (match_id, participant_id) do update set
      possession = excluded.possession, shots = excluded.shots, shots_on_target = excluded.shots_on_target,
      fouls = excluded.fouls, offsides = excluded.offsides, corners = excluded.corners,
      free_kicks = excluded.free_kicks, passes = excluded.passes, passes_completed = excluded.passes_completed,
      crosses = excluded.crosses, interceptions = excluded.interceptions, tackles = excluded.tackles,
      saves = excluded.saves;
  end if;
end;
$$;

revoke execute on function public.submit_match_stats(uuid, jsonb, jsonb) from public;
grant execute on function public.submit_match_stats(uuid, jsonb, jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- Perfil de jogo: médias das estatísticas detalhadas do jogador,
-- cross-liga, a partir das partidas em que ele preencheu esses dados -
-- pra dar uma base real de "como esse time costuma jogar" pro
-- adversário antes de encarar.
-- ---------------------------------------------------------------------
create or replace function public.player_match_stats_summary(p_user_id uuid)
returns table (
  matches_with_stats bigint,
  avg_possession numeric,
  avg_shots numeric,
  avg_shots_on_target numeric,
  avg_fouls numeric,
  avg_offsides numeric,
  avg_corners numeric,
  avg_free_kicks numeric,
  avg_passes numeric,
  pass_accuracy numeric,
  avg_crosses numeric,
  avg_interceptions numeric,
  avg_tackles numeric,
  avg_saves numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with my_participants as (
    select ep.id from public.edition_participants ep where ep.user_id = p_user_id
  ),
  my_stats as (
    select ms.*
    from public.match_stats ms
    join my_participants mp on mp.id = ms.participant_id
  )
  select
    count(*)::bigint as matches_with_stats,
    round(avg(possession), 1) as avg_possession,
    round(avg(shots), 1) as avg_shots,
    round(avg(shots_on_target), 1) as avg_shots_on_target,
    round(avg(fouls), 1) as avg_fouls,
    round(avg(offsides), 1) as avg_offsides,
    round(avg(corners), 1) as avg_corners,
    round(avg(free_kicks), 1) as avg_free_kicks,
    round(avg(passes), 1) as avg_passes,
    case when sum(passes) > 0 then round(100.0 * sum(passes_completed) / sum(passes), 1) else null end as pass_accuracy,
    round(avg(crosses), 1) as avg_crosses,
    round(avg(interceptions), 1) as avg_interceptions,
    round(avg(tackles), 1) as avg_tackles,
    round(avg(saves), 1) as avg_saves
  from my_stats;
$$;

revoke execute on function public.player_match_stats_summary(uuid) from public, anon;
grant execute on function public.player_match_stats_summary(uuid) to authenticated;
