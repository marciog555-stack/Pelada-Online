-- Etapa 4: campeonato, escudo por edição e fluxo de resultado completo.

-- ---------------------------------------------------------------------
-- Tabelas (antes das funções "sql", que validam contra o catálogo já
-- na criação).
-- ---------------------------------------------------------------------
create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  name text not null,
  -- Só os 2 presets da Etapa 3 por enquanto; os demais entram na Etapa 10
  -- (precisará de uma migration alterando esse check).
  preset_id text not null check (preset_id in ('brasileirao-serie-a', 'mata-mata-simples')),
  connection_drop_rule text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint competition_name_length check (char_length(name) between 2 and 60)
);

create table public.editions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  number integer not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'in_progress', 'completed')),
  round_deadline_days integer not null default 7,
  wo_home_goals integer not null default 3,
  wo_away_goals integer not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  unique (competition_id, number)
);

create table public.edition_participants (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.editions (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  team_name text not null,
  crest_url text,
  primary_color text not null default '#33e58c',
  final_position integer,
  created_at timestamptz not null default now(),
  unique (edition_id, user_id),
  constraint team_name_length check (char_length(team_name) between 2 and 40),
  constraint primary_color_format check (primary_color ~ '^#[0-9A-Fa-f]{6}$')
);

create table public.crest_change_requests (
  id uuid primary key default gen_random_uuid(),
  edition_participant_id uuid not null references public.edition_participants (id) on delete cascade,
  requested_crest_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.editions (id) on delete cascade,
  round integer not null,
  leg integer not null default 1,
  home_participant_id uuid not null references public.edition_participants (id),
  away_participant_id uuid not null references public.edition_participants (id),
  home_goals integer,
  away_goals integer,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'pending_confirmation', 'confirmed', 'contested', 'wo')),
  wo_winner_participant_id uuid references public.edition_participants (id),
  reported_by uuid references public.profiles (id),
  reported_at timestamptz,
  deadline_at timestamptz,
  confirmed_at timestamptz,
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint different_participants check (home_participant_id <> away_participant_id)
);

create index idx_matches_edition_id on public.matches (edition_id);

create table public.match_reports (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  reported_by uuid not null references public.profiles (id),
  home_goals integer not null,
  away_goals integer not null,
  home_red_cards integer not null default 0,
  away_red_cards integer not null default 0,
  home_yellow_cards integer not null default 0,
  away_yellow_cards integer not null default 0,
  screenshot_path text not null,
  kind text not null default 'report' check (kind in ('report', 'dispute')),
  message text,
  created_at timestamptz not null default now()
);

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  participant_id uuid not null references public.edition_participants (id),
  event_type text not null check (event_type in ('goal', 'yellow_card', 'red_card')),
  athlete_name text not null,
  assist_athlete_name text,
  created_at timestamptz not null default now()
);

create index idx_match_events_match_id on public.match_events (match_id);

-- ---------------------------------------------------------------------
-- Helpers de escopo (mesmo padrão de is_league_member/is_league_admin).
-- ---------------------------------------------------------------------
create or replace function public.league_id_for_competition(p_competition_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select league_id from public.competitions where id = p_competition_id;
$$;

create or replace function public.league_id_for_edition(p_edition_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select public.league_id_for_competition(c.id)
  from public.editions e
  join public.competitions c on c.id = e.competition_id
  where e.id = p_edition_id;
$$;

create or replace function public.league_id_for_match(p_match_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select public.league_id_for_edition(edition_id) from public.matches where id = p_match_id;
$$;

create or replace function public.edition_status(p_edition_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select status from public.editions where id = p_edition_id;
$$;

create or replace function public.is_match_player(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.matches m
    join public.edition_participants ep on ep.id in (m.home_participant_id, m.away_participant_id)
    where m.id = p_match_id and ep.user_id = auth.uid()
  );
$$;

-- CREATE FUNCTION concede EXECUTE a PUBLIC por padrão, o que inclui
-- anon mesmo revogando só dele (é preciso revogar de PUBLIC mesmo).
revoke execute on function public.league_id_for_competition(uuid) from public;
revoke execute on function public.league_id_for_edition(uuid) from public;
revoke execute on function public.league_id_for_match(uuid) from public;
revoke execute on function public.edition_status(uuid) from public;
revoke execute on function public.is_match_player(uuid) from public;

grant execute on function public.league_id_for_competition(uuid) to authenticated;
grant execute on function public.league_id_for_edition(uuid) to authenticated;
grant execute on function public.league_id_for_match(uuid) to authenticated;
grant execute on function public.edition_status(uuid) to authenticated;
grant execute on function public.is_match_player(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- RLS: competitions / editions
-- ---------------------------------------------------------------------
alter table public.competitions enable row level security;

create policy "league members read competitions"
  on public.competitions for select
  to authenticated
  using (public.is_league_member(league_id));

create policy "league admins manage competitions"
  on public.competitions for all
  to authenticated
  using (public.is_league_admin(league_id))
  with check (public.is_league_admin(league_id));

alter table public.editions enable row level security;

create policy "league members read editions"
  on public.editions for select
  to authenticated
  using (public.is_league_member(public.league_id_for_competition(competition_id)));

create policy "league admins manage editions"
  on public.editions for all
  to authenticated
  using (public.is_league_admin(public.league_id_for_competition(competition_id)))
  with check (public.is_league_admin(public.league_id_for_competition(competition_id)));

-- ---------------------------------------------------------------------
-- RLS: edition_participants (o próprio jogador entra e edita antes do
-- início; depois disso só o admin mexe, e escudo passa a exigir pedido).
-- ---------------------------------------------------------------------
alter table public.edition_participants enable row level security;

create policy "league members read participants"
  on public.edition_participants for select
  to authenticated
  using (public.is_league_member(public.league_id_for_edition(edition_id)));

create policy "members join upcoming editions themselves"
  on public.edition_participants for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_league_member(public.league_id_for_edition(edition_id))
    and public.edition_status(edition_id) = 'upcoming'
  );

create policy "admins add participants"
  on public.edition_participants for insert
  to authenticated
  with check (public.is_league_admin(public.league_id_for_edition(edition_id)));

create policy "owner edits own entry before start"
  on public.edition_participants for update
  to authenticated
  using (user_id = auth.uid() and public.edition_status(edition_id) = 'upcoming')
  with check (user_id = auth.uid() and public.edition_status(edition_id) = 'upcoming');

create policy "admins edit any entry"
  on public.edition_participants for update
  to authenticated
  using (public.is_league_admin(public.league_id_for_edition(edition_id)))
  with check (public.is_league_admin(public.league_id_for_edition(edition_id)));

create policy "owner leaves before start"
  on public.edition_participants for delete
  to authenticated
  using (user_id = auth.uid() and public.edition_status(edition_id) = 'upcoming');

create policy "admins remove participants before start"
  on public.edition_participants for delete
  to authenticated
  using (public.is_league_admin(public.league_id_for_edition(edition_id)) and public.edition_status(edition_id) = 'upcoming');

-- ---------------------------------------------------------------------
-- RLS: crest_change_requests
-- ---------------------------------------------------------------------
alter table public.crest_change_requests enable row level security;

create policy "owner creates crest change request"
  on public.crest_change_requests for insert
  to authenticated
  with check (
    exists (
      select 1 from public.edition_participants ep
      where ep.id = edition_participant_id and ep.user_id = auth.uid()
    )
  );

create policy "owner and league admins read crest requests"
  on public.crest_change_requests for select
  to authenticated
  using (
    exists (
      select 1 from public.edition_participants ep
      where ep.id = edition_participant_id
        and (ep.user_id = auth.uid() or public.is_league_admin(public.league_id_for_edition(ep.edition_id)))
    )
  );

create policy "league admins resolve crest requests"
  on public.crest_change_requests for update
  to authenticated
  using (
    exists (
      select 1 from public.edition_participants ep
      where ep.id = edition_participant_id and public.is_league_admin(public.league_id_for_edition(ep.edition_id))
    )
  )
  with check (
    exists (
      select 1 from public.edition_participants ep
      where ep.id = edition_participant_id and public.is_league_admin(public.league_id_for_edition(ep.edition_id))
    )
  );

create or replace function public.handle_crest_request_resolution()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status <> 'approved' then
    update public.edition_participants
    set crest_url = new.requested_crest_url
    where id = new.edition_participant_id;
  end if;
  return new;
end;
$$;

create trigger on_crest_request_resolved
  after update on public.crest_change_requests
  for each row execute function public.handle_crest_request_resolution();

revoke execute on function public.handle_crest_request_resolution() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- RLS: matches / match_reports / match_events
-- ---------------------------------------------------------------------
alter table public.matches enable row level security;

create policy "league members read matches"
  on public.matches for select
  to authenticated
  using (public.is_league_member(public.league_id_for_edition(edition_id)));

create policy "league admins manage matches"
  on public.matches for all
  to authenticated
  using (public.is_league_admin(public.league_id_for_edition(edition_id)))
  with check (public.is_league_admin(public.league_id_for_edition(edition_id)));

alter table public.match_reports enable row level security;

create policy "match players and admins read reports"
  on public.match_reports for select
  to authenticated
  using (public.is_match_player(match_id) or public.is_league_admin(public.league_id_for_match(match_id)));

alter table public.match_events enable row level security;

create policy "match players and admins read events"
  on public.match_events for select
  to authenticated
  using (public.is_match_player(match_id) or public.is_league_admin(public.league_id_for_match(match_id)));

create policy "league admins manage events"
  on public.match_events for all
  to authenticated
  using (public.is_league_admin(public.league_id_for_match(match_id)))
  with check (public.is_league_admin(public.league_id_for_match(match_id)));

-- match_reports e match_events só são escritos pelas funções abaixo
-- (SECURITY DEFINER) - sem policy de INSERT direto pra ninguém.

-- ---------------------------------------------------------------------
-- Fluxo de resultado: lançar/contestar, confirmar, admin resolve, W.O.
-- ---------------------------------------------------------------------
create or replace function public.submit_match_report(
  p_match_id uuid,
  p_home_goals integer,
  p_away_goals integer,
  p_home_red_cards integer,
  p_away_red_cards integer,
  p_home_yellow_cards integer,
  p_away_yellow_cards integer,
  p_screenshot_path text,
  p_events jsonb
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches;
  v_event jsonb;
  v_new_status text;
  v_result public.matches;
begin
  select * into v_match from public.matches where id = p_match_id;
  if v_match.id is null then
    raise exception 'match_not_found';
  end if;
  if v_match.status not in ('scheduled', 'pending_confirmation') then
    raise exception 'match_not_reportable';
  end if;
  if not public.is_match_player(p_match_id) then
    raise exception 'not_a_match_player';
  end if;

  if v_match.status = 'pending_confirmation' then
    v_new_status := case when v_match.reported_by = auth.uid() then 'pending_confirmation' else 'contested' end;
  else
    v_new_status := 'pending_confirmation';
  end if;

  insert into public.match_reports (
    match_id, reported_by, home_goals, away_goals,
    home_red_cards, away_red_cards, home_yellow_cards, away_yellow_cards,
    screenshot_path, kind
  ) values (
    p_match_id, auth.uid(), p_home_goals, p_away_goals,
    p_home_red_cards, p_away_red_cards, p_home_yellow_cards, p_away_yellow_cards,
    p_screenshot_path, case when v_new_status = 'contested' then 'dispute' else 'report' end
  );

  delete from public.match_events where match_id = p_match_id;
  for v_event in select * from jsonb_array_elements(p_events) loop
    insert into public.match_events (match_id, participant_id, event_type, athlete_name, assist_athlete_name)
    values (
      p_match_id,
      (v_event ->> 'participant_id')::uuid,
      v_event ->> 'event_type',
      v_event ->> 'athlete_name',
      nullif(v_event ->> 'assist_athlete_name', '')
    );
  end loop;

  update public.matches set
    home_goals = p_home_goals,
    away_goals = p_away_goals,
    status = v_new_status,
    reported_by = auth.uid(),
    reported_at = now()
  where id = p_match_id
  returning * into v_result;

  return v_result;
end;
$$;

revoke execute on function public.submit_match_report(
  uuid, integer, integer, integer, integer, integer, integer, text, jsonb
) from public;
grant execute on function public.submit_match_report(
  uuid, integer, integer, integer, integer, integer, integer, text, jsonb
) to authenticated;

create or replace function public.confirm_match_report(p_match_id uuid)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches;
  v_result public.matches;
begin
  select * into v_match from public.matches where id = p_match_id;
  if v_match.id is null then
    raise exception 'match_not_found';
  end if;
  if v_match.status <> 'pending_confirmation' then
    raise exception 'match_not_pending';
  end if;
  if not public.is_match_player(p_match_id) then
    raise exception 'not_a_match_player';
  end if;
  if v_match.reported_by = auth.uid() then
    raise exception 'cannot_confirm_own_report';
  end if;

  update public.matches set status = 'confirmed', confirmed_at = now()
  where id = p_match_id
  returning * into v_result;

  return v_result;
end;
$$;

revoke execute on function public.confirm_match_report(uuid) from public;
grant execute on function public.confirm_match_report(uuid) to authenticated;

create or replace function public.resolve_contested_match(
  p_match_id uuid,
  p_home_goals integer,
  p_away_goals integer
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches;
  v_result public.matches;
begin
  select * into v_match from public.matches where id = p_match_id;
  if v_match.id is null then
    raise exception 'match_not_found';
  end if;
  if v_match.status <> 'contested' then
    raise exception 'match_not_contested';
  end if;
  if not public.is_league_admin(public.league_id_for_match(p_match_id)) then
    raise exception 'not_a_league_admin';
  end if;

  update public.matches set
    home_goals = p_home_goals,
    away_goals = p_away_goals,
    status = 'confirmed',
    confirmed_at = now(),
    resolved_by = auth.uid(),
    resolved_at = now()
  where id = p_match_id
  returning * into v_result;

  return v_result;
end;
$$;

revoke execute on function public.resolve_contested_match(uuid, integer, integer) from public;
grant execute on function public.resolve_contested_match(uuid, integer, integer) to authenticated;

create or replace function public.apply_match_wo(p_match_id uuid, p_winner_participant_id uuid)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches;
  v_edition public.editions;
  v_home_goals integer;
  v_away_goals integer;
  v_result public.matches;
begin
  select * into v_match from public.matches where id = p_match_id;
  if v_match.id is null then
    raise exception 'match_not_found';
  end if;
  if not public.is_league_admin(public.league_id_for_edition(v_match.edition_id)) then
    raise exception 'not_a_league_admin';
  end if;
  if p_winner_participant_id not in (v_match.home_participant_id, v_match.away_participant_id) then
    raise exception 'winner_must_be_a_match_participant';
  end if;

  select * into v_edition from public.editions where id = v_match.edition_id;

  if p_winner_participant_id = v_match.home_participant_id then
    v_home_goals := v_edition.wo_home_goals;
    v_away_goals := v_edition.wo_away_goals;
  else
    v_home_goals := v_edition.wo_away_goals;
    v_away_goals := v_edition.wo_home_goals;
  end if;

  update public.matches set
    home_goals = v_home_goals,
    away_goals = v_away_goals,
    status = 'wo',
    wo_winner_participant_id = p_winner_participant_id,
    resolved_by = auth.uid(),
    resolved_at = now(),
    confirmed_at = now()
  where id = p_match_id
  returning * into v_result;

  return v_result;
end;
$$;

revoke execute on function public.apply_match_wo(uuid, uuid) from public;
grant execute on function public.apply_match_wo(uuid, uuid) to authenticated;

-- Sem resposta em 24h: confirma sozinho. Roda no pg_cron (ver migration
-- seguinte) - não é chamada pelo client.
create or replace function public.auto_confirm_overdue_matches()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.matches
  set status = 'confirmed', confirmed_at = now()
  where status = 'pending_confirmation'
    and reported_at is not null
    and reported_at < now() - interval '24 hours';
end;
$$;

revoke execute on function public.auto_confirm_overdue_matches() from public, anon, authenticated;
