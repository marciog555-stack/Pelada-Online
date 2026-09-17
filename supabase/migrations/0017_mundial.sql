-- Etapa 8: Mundial - torneio global entre campeões de liga. Esta etapa
-- cobre elegibilidade, vagas e chave; o sorteio "ao vivo" com animação é
-- só apresentação (Etapa 9) sobre o resultado que já sai pronto daqui.
--
-- Tabelas paralelas às de competições de liga (não league_id-scoped -
-- competitions/editions exigem league_id, o Mundial é da plataforma
-- inteira), com o mesmo padrão de confiança: RLS "for all" pro admin da
-- plataforma, e o client escreve os dados computados direto (motor de
-- regras da Etapa 3 pros pareamentos/byes) - igual startEdition e
-- advanceKnockoutRound já fazem pra admin de liga.

create table public.mundials (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  name text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed')),
  max_slots integer,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  constraint mundial_name_length check (char_length(name) between 2 and 60),
  constraint mundial_max_slots_valid check (max_slots is null or max_slots >= 2)
);

create table public.mundial_slots (
  id uuid primary key default gen_random_uuid(),
  mundial_id uuid not null references public.mundials (id) on delete cascade,
  league_id uuid not null references public.leagues (id),
  edition_id uuid not null references public.editions (id),
  user_id uuid not null references public.profiles (id),
  team_name text not null,
  crest_url text,
  confirmed boolean not null default false,
  seed integer,
  created_at timestamptz not null default now(),
  unique (mundial_id, league_id)
);

create index idx_mundial_slots_mundial_id on public.mundial_slots (mundial_id);

create table public.mundial_matches (
  id uuid primary key default gen_random_uuid(),
  mundial_id uuid not null references public.mundials (id) on delete cascade,
  round integer not null,
  home_slot_id uuid references public.mundial_slots (id),
  away_slot_id uuid references public.mundial_slots (id),
  home_goals integer,
  away_goals integer,
  status text not null default 'scheduled' check (status in ('scheduled', 'confirmed')),
  wo_winner_slot_id uuid references public.mundial_slots (id),
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint mundial_match_has_a_slot check (home_slot_id is not null or away_slot_id is not null)
);

create index idx_mundial_matches_mundial_id on public.mundial_matches (mundial_id);

-- ---------------------------------------------------------------------
-- Limite de vagas: barra confirmar um slot além de max_slots (quando
-- definido). Concorrência não é uma preocupação real aqui (um admin só).
-- ---------------------------------------------------------------------
create or replace function public.enforce_mundial_slot_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_max integer;
  v_confirmed_count integer;
begin
  if new.confirmed is distinct from true then
    return new;
  end if;

  select max_slots into v_max from public.mundials where id = new.mundial_id;
  if v_max is null then
    return new;
  end if;

  select count(*) into v_confirmed_count
  from public.mundial_slots
  where mundial_id = new.mundial_id and confirmed = true and id <> new.id;

  if v_confirmed_count >= v_max then
    raise exception 'mundial_slots_full';
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_mundial_slot_limit() from public, anon, authenticated;

create trigger enforce_mundial_slot_limit_trigger
  before insert or update on public.mundial_slots
  for each row execute function public.enforce_mundial_slot_limit();

-- ---------------------------------------------------------------------
-- RLS: leitura pública (qualquer autenticado, mesmo espírito de
-- temporadas/sala de troféus), escrita só admin da plataforma.
-- ---------------------------------------------------------------------
alter table public.mundials enable row level security;
alter table public.mundial_slots enable row level security;
alter table public.mundial_matches enable row level security;

create policy "mundials are readable by authenticated users"
  on public.mundials for select to authenticated using (true);
create policy "platform admins manage mundials"
  on public.mundials for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy "mundial_slots are readable by authenticated users"
  on public.mundial_slots for select to authenticated using (true);
create policy "platform admins manage mundial_slots"
  on public.mundial_slots for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy "mundial_matches are readable by authenticated users"
  on public.mundial_matches for select to authenticated using (true);
create policy "platform admins manage mundial_matches"
  on public.mundial_matches for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ---------------------------------------------------------------------
-- Elegibilidade: o campeão mais recente de cada liga, dentre as edições
-- encerradas dentro do período da temporada do mundial. slot_id vem
-- preenchido quando essa liga já tem vaga criada (confirmada ou não).
-- ---------------------------------------------------------------------
create or replace function public.mundial_eligible_champions(p_mundial_id uuid)
returns table (
  league_id uuid,
  league_name text,
  edition_id uuid,
  completed_at timestamptz,
  user_id uuid,
  team_name text,
  crest_url text,
  display_name text,
  efootball_id text,
  slot_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  with mundial as (
    select m.season_id from public.mundials m where m.id = p_mundial_id
  ),
  season as (
    select s.starts_at, s.ends_at from public.seasons s, mundial where s.id = mundial.season_id
  ),
  champions as (
    select
      c.league_id,
      e.id as edition_id,
      e.completed_at,
      ea.participant_id,
      row_number() over (partition by c.league_id order by e.completed_at desc) as rn
    from public.edition_awards ea
    join public.editions e on e.id = ea.edition_id
    join public.competitions c on c.id = e.competition_id, season
    where ea.award_type = 'champion'
      and e.completed_at between season.starts_at and season.ends_at
  )
  select
    l.id as league_id,
    l.name as league_name,
    ch.edition_id,
    ch.completed_at,
    ep.user_id,
    ep.team_name,
    ep.crest_url,
    pr.display_name,
    pr.efootball_id::text,
    ms.id as slot_id
  from champions ch
  join public.leagues l on l.id = ch.league_id
  join public.edition_participants ep on ep.id = ch.participant_id
  join public.profiles pr on pr.id = ep.user_id
  left join public.mundial_slots ms on ms.mundial_id = p_mundial_id and ms.league_id = ch.league_id
  where ch.rn = 1
  order by ch.completed_at desc;
$$;

revoke execute on function public.mundial_eligible_champions(uuid) from public, anon;
grant execute on function public.mundial_eligible_champions(uuid) to authenticated;
