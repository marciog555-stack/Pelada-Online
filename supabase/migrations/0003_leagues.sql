-- Etapa 2: ligas e convites.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- leagues / league_members (tabelas antes das funcoes: funcoes "sql"
-- validam o corpo contra o catalogo na criacao).
-- ---------------------------------------------------------------------
create table public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references auth.users (id),
  invite_code text not null unique default encode(gen_random_bytes(6), 'hex'),
  require_approval boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint league_name_length check (char_length(name) between 2 and 60)
);

create table public.league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('pending', 'active')),
  joined_at timestamptz not null default now(),
  unique (league_id, user_id)
);

create index idx_league_members_user_id on public.league_members (user_id);

create trigger set_leagues_updated_at
  before update on public.leagues
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Helpers de papel/membresia (SECURITY DEFINER pra nao recursar RLS e
-- serem reutilizados por outras tabelas escopadas em liga nas proximas
-- etapas: competitions, editions, matches...).
-- ---------------------------------------------------------------------
create or replace function public.league_role(p_league_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.league_members
  where league_id = p_league_id and user_id = auth.uid() and status = 'active'
  limit 1;
$$;

create or replace function public.is_league_member(p_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.league_role(p_league_id) is not null;
$$;

create or replace function public.is_league_admin(p_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.league_role(p_league_id) in ('owner', 'admin');
$$;

-- ---------------------------------------------------------------------
-- RLS leagues
-- ---------------------------------------------------------------------
alter table public.leagues enable row level security;

-- membros ativos leem a liga normalmente; quem pediu entrada (pending)
-- tambem ve o basico da liga pra acompanhar o pedido.
create policy "members and requesters read their leagues"
  on public.leagues for select
  to authenticated
  using (
    exists (
      select 1 from public.league_members lm
      where lm.league_id = leagues.id and lm.user_id = auth.uid()
    )
  );

create policy "authenticated users create leagues"
  on public.leagues for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "owner or admin updates league"
  on public.leagues for update
  to authenticated
  using (public.is_league_admin(id))
  with check (public.is_league_admin(id));

-- ---------------------------------------------------------------------
-- RLS league_members
-- ---------------------------------------------------------------------
alter table public.league_members enable row level security;

create policy "members read league_members of their leagues"
  on public.league_members for select
  to authenticated
  using (public.is_league_member(league_id) or user_id = auth.uid());

-- Sem policy de INSERT: entrada acontece via join_league_by_invite_code()
-- (SECURITY DEFINER) ou pelo trigger que cria o dono junto com a liga.

create policy "admins manage league_members"
  on public.league_members for update
  to authenticated
  using (public.is_league_admin(league_id))
  with check (public.is_league_admin(league_id) and role <> 'owner');

create policy "admins remove members"
  on public.league_members for delete
  to authenticated
  using (public.is_league_admin(league_id) and role <> 'owner');

create policy "members leave on their own"
  on public.league_members for delete
  to authenticated
  using (user_id = auth.uid() and role <> 'owner');

-- ---------------------------------------------------------------------
-- Dono entra automaticamente como "owner"/"active" ao criar a liga.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_league()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.league_members (league_id, user_id, role, status)
  values (new.id, new.owner_id, 'owner', 'active');
  return new;
end;
$$;

create trigger on_league_created
  after insert on public.leagues
  for each row execute function public.handle_new_league();

revoke execute on function public.handle_new_league() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Convite: preview publico (pra quem so tem o link) e entrada de fato.
-- ---------------------------------------------------------------------
create or replace function public.get_league_preview_by_invite_code(p_invite_code text)
returns table (
  id uuid,
  name text,
  description text,
  member_count bigint,
  require_approval boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id,
    l.name,
    l.description,
    (select count(*) from public.league_members lm where lm.league_id = l.id and lm.status = 'active'),
    l.require_approval
  from public.leagues l
  where l.invite_code = p_invite_code;
$$;

grant execute on function public.get_league_preview_by_invite_code(text) to authenticated;

create or replace function public.join_league_by_invite_code(p_invite_code text)
returns public.league_members
language plpgsql
security definer
set search_path = public
as $$
declare
  target_league public.leagues;
  existing public.league_members;
  new_status text;
  result public.league_members;
begin
  select * into target_league from public.leagues where invite_code = p_invite_code;
  if target_league.id is null then
    raise exception 'invite_code_not_found';
  end if;

  select * into existing from public.league_members
    where league_id = target_league.id and user_id = auth.uid();
  if existing.id is not null then
    return existing;
  end if;

  new_status := case when target_league.require_approval then 'pending' else 'active' end;

  insert into public.league_members (league_id, user_id, role, status)
  values (target_league.id, auth.uid(), 'member', new_status)
  returning * into result;

  return result;
end;
$$;

grant execute on function public.join_league_by_invite_code(text) to authenticated;
