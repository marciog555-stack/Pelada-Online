-- Revoga tanto de PUBLIC quanto de anon explicitamente: nas migrations
-- anteriores "revoke ... from public" bastou, mas aqui o ACL mostrou
-- anon com grant direto mesmo depois do revoke na mesma migration -
-- então agora é explícito nos dois, numa migration separada.
revoke execute on function public.league_id_for_competition(uuid) from public, anon;
revoke execute on function public.league_id_for_edition(uuid) from public, anon;
revoke execute on function public.league_id_for_match(uuid) from public, anon;
revoke execute on function public.edition_status(uuid) from public, anon;
revoke execute on function public.is_match_player(uuid) from public, anon;
revoke execute on function public.submit_match_report(
  uuid, integer, integer, integer, integer, integer, integer, text, jsonb
) from public, anon;
revoke execute on function public.confirm_match_report(uuid) from public, anon;
revoke execute on function public.resolve_contested_match(uuid, integer, integer) from public, anon;
revoke execute on function public.apply_match_wo(uuid, uuid) from public, anon;
