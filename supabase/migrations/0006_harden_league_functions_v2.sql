-- A revogacao anterior (0004) so tirou de "anon" explicitamente, mas a
-- funcao ainda estava liberada via o grant implicito para PUBLIC dado na
-- criacao (PUBLIC cobre todo mundo, inclusive anon, independente de
-- revokes pontuais em um role especifico). Revoga de PUBLIC de verdade e
-- devolve so pra quem precisa (authenticated).
revoke execute on function public.get_league_preview_by_invite_code(text) from public;
revoke execute on function public.join_league_by_invite_code(text) from public;
revoke execute on function public.league_role(uuid) from public;
revoke execute on function public.is_league_member(uuid) from public;
revoke execute on function public.is_league_admin(uuid) from public;

grant execute on function public.get_league_preview_by_invite_code(text) to authenticated;
grant execute on function public.join_league_by_invite_code(text) to authenticated;
grant execute on function public.league_role(uuid) to authenticated;
grant execute on function public.is_league_member(uuid) to authenticated;
grant execute on function public.is_league_admin(uuid) to authenticated;
