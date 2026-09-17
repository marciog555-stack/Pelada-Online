-- Etapa 5 revisitada: dá pro admin da liga confirmar direto um resultado
-- já lançado e aguardando o adversário, sem precisar esperar a
-- confirmação automática nem recorrer a W.O. (que declara vencedor por
-- placar padrão, não confirma o placar realmente jogado).
create or replace function public.admin_confirm_match_report(p_match_id uuid)
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
  if not public.is_league_admin(public.league_id_for_match(p_match_id)) then
    raise exception 'not_a_league_admin';
  end if;

  update public.matches set status = 'confirmed', confirmed_at = now()
  where id = p_match_id
  returning * into v_result;

  return v_result;
end;
$$;

revoke execute on function public.admin_confirm_match_report(uuid) from public;
grant execute on function public.admin_confirm_match_report(uuid) to authenticated;

-- Janela de confirmação automática: 24h -> 12h.
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
    and reported_at < now() - interval '12 hours';
end;
$$;
