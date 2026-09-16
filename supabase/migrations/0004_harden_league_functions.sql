-- Nada aqui precisa ser chamado por quem nao esta logado (o app inteiro
-- exige login antes de qualquer tela, inclusive a de convite).
revoke execute on function public.get_league_preview_by_invite_code(text) from anon;
revoke execute on function public.join_league_by_invite_code(text) from anon;
revoke execute on function public.league_role(uuid) from anon;
revoke execute on function public.is_league_member(uuid) from anon;
revoke execute on function public.is_league_admin(uuid) from anon;
