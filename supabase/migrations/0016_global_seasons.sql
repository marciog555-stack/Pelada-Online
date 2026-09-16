-- Etapa 7: temporadas globais (plataforma inteira, não por liga) e o
-- ranking global ponderado calculado a partir delas.

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint season_name_length check (char_length(name) between 2 and 60),
  constraint season_dates_valid check (ends_at > starts_at)
);

alter table public.seasons enable row level security;

-- Temporadas e o ranking delas são públicos (qualquer usuário logado),
-- mesmo mecanismo de "sala de troféus" da Etapa 6 - só quem cria/edita é
-- restrito a admin da plataforma.
create policy "seasons are readable by authenticated users"
  on public.seasons for select
  to authenticated
  using (true);

create policy "platform admins manage seasons"
  on public.seasons for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- Ranking global ponderado: soma, por usuário, os pontos de cada edição
-- encerrada dentro do período da temporada em QUALQUER liga (não só as
-- que o chamador participa - é intencionalmente público, mesmo espírito
-- da sala de troféus). Peso = colocação final relativa ao tamanho da
-- edição (campeão de uma edição com mais gente vale mais que campeão de
-- uma com pouca gente) + bônus fixo por título.
create or replace function public.global_season_ranking(p_season_id uuid)
returns table (
  user_id uuid,
  efootball_id text,
  display_name text,
  avatar_url text,
  editions_played bigint,
  titles bigint,
  points numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with season as (
    select starts_at, ends_at from public.seasons where id = p_season_id
  ),
  qualifying_editions as (
    select e.id, (
      select count(*) from public.edition_participants ep2 where ep2.edition_id = e.id
    ) as participant_count
    from public.editions e, season s
    where e.status = 'completed'
      and e.completed_at is not null
      and e.completed_at between s.starts_at and s.ends_at
  ),
  scored as (
    select
      ep.user_id,
      case when ep.final_position = 1 then 1 else 0 end as is_title,
      round(
        (qe.participant_count - ep.final_position + 1)::numeric / qe.participant_count * 100
        + case when ep.final_position = 1 then 50 else 0 end,
        1
      ) as edition_points
    from qualifying_editions qe
    join public.edition_participants ep on ep.edition_id = qe.id
    where ep.final_position is not null and qe.participant_count > 0
  )
  select
    pr.id as user_id,
    pr.efootball_id::text,
    pr.display_name,
    pr.avatar_url,
    count(*)::bigint as editions_played,
    sum(s.is_title)::bigint as titles,
    sum(s.edition_points) as points
  from scored s
  join public.profiles pr on pr.id = s.user_id
  group by pr.id, pr.efootball_id, pr.display_name, pr.avatar_url
  order by points desc, titles desc, pr.display_name asc;
$$;

revoke execute on function public.global_season_ranking(uuid) from public, anon;
grant execute on function public.global_season_ranking(uuid) to authenticated;
