-- Vitrine de taças (evolução da Etapa 11): em vez de só um badge genérico
-- de "campeão", o perfil mostra uma taça por FORMATO de competição
-- (preset) que o jogador já venceu - o Mundial já tem sua contagem via
-- player_achievements (mundial_champion); esta RPC cobre o resto.

create or replace function public.player_titles_by_preset(p_user_id uuid)
returns table (
  preset_id text,
  title_count bigint,
  last_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select c.preset_id, count(*)::bigint as title_count, max(e.completed_at) as last_at
  from public.edition_awards ea
  join public.edition_participants ep on ep.id = ea.participant_id
  join public.editions e on e.id = ea.edition_id
  join public.competitions c on c.id = e.competition_id
  where ea.award_type = 'champion' and ep.user_id = p_user_id
  group by c.preset_id;
$$;

revoke execute on function public.player_titles_by_preset(uuid) from public, anon;
grant execute on function public.player_titles_by_preset(uuid) to authenticated;
