-- Etapa 6: fechamento de edição, premiações e sala de troféus.
--
-- A posição final dos participantes (edition_participants.final_position,
-- já existente desde a Etapa 4) e as premiações são calculadas no client
-- (reaproveitando o motor de regras / estatísticas da Etapa 5, inclusive
-- o desempate por critérios do preset), e essa RPC só valida e grava -
-- mesmo padrão de confiança já usado em apply_match_wo/resolve_contested_match,
-- onde o admin da liga já tem poder de decisão final.

create table public.edition_awards (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.editions (id) on delete cascade,
  award_type text not null check (award_type in ('champion', 'runner_up', 'top_scorer', 'best_defense')),
  participant_id uuid not null references public.edition_participants (id),
  athlete_name text,
  value integer,
  created_at timestamptz not null default now()
);

create index idx_edition_awards_edition_id on public.edition_awards (edition_id);

alter table public.edition_awards enable row level security;

create policy "league members read edition_awards"
  on public.edition_awards for select
  to authenticated
  using (public.is_league_member(public.league_id_for_edition(edition_id)));

-- Sem policy de insert/update/delete: só a RPC abaixo escreve aqui, como
-- dono das tabelas (SECURITY DEFINER) - mesmo padrão das outras RPCs de
-- escrita desta app.
create or replace function public.close_edition(
  p_edition_id uuid,
  p_final_positions jsonb,
  p_awards jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_league_id uuid;
  v_participant_count integer;
  v_positions_count integer;
  v_unfinished_count integer;
  v_pos record;
  v_award record;
begin
  v_league_id := public.league_id_for_edition(p_edition_id);
  if v_league_id is null then
    raise exception 'edition_not_found';
  end if;
  if not public.is_league_admin(v_league_id) then
    raise exception 'not_a_league_admin';
  end if;

  if not exists (select 1 from public.editions where id = p_edition_id and status = 'in_progress') then
    raise exception 'edition_not_in_progress';
  end if;

  select count(*) into v_unfinished_count
  from public.matches
  where edition_id = p_edition_id
    and status in ('scheduled', 'pending_confirmation', 'contested');
  if v_unfinished_count > 0 then
    raise exception 'edition_has_unfinished_matches';
  end if;

  select count(*) into v_participant_count from public.edition_participants where edition_id = p_edition_id;
  select count(*) into v_positions_count from jsonb_array_elements(p_final_positions);
  if v_positions_count <> v_participant_count then
    raise exception 'final_positions_mismatch';
  end if;

  for v_pos in
    select * from jsonb_to_recordset(p_final_positions) as x(participant_id uuid, final_position integer)
  loop
    update public.edition_participants
    set final_position = v_pos.final_position
    where id = v_pos.participant_id and edition_id = p_edition_id;
    if not found then
      raise exception 'invalid_participant_in_final_positions';
    end if;
  end loop;

  for v_award in
    select * from jsonb_to_recordset(p_awards)
      as x(award_type text, participant_id uuid, athlete_name text, value integer)
  loop
    if v_award.award_type not in ('champion', 'runner_up', 'top_scorer', 'best_defense') then
      raise exception 'invalid_award_type';
    end if;
    if not exists (
      select 1 from public.edition_participants where id = v_award.participant_id and edition_id = p_edition_id
    ) then
      raise exception 'invalid_participant_in_awards';
    end if;
    insert into public.edition_awards (edition_id, award_type, participant_id, athlete_name, value)
    values (p_edition_id, v_award.award_type, v_award.participant_id, v_award.athlete_name, v_award.value);
  end loop;

  update public.editions
  set status = 'completed', completed_at = now()
  where id = p_edition_id;
end;
$$;

revoke execute on function public.close_edition(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.close_edition(uuid, jsonb, jsonb) to authenticated;
