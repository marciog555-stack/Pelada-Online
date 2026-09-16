-- O INSERT em leagues faz RETURNING *, avaliado contra a policy de SELECT
-- antes do trigger AFTER INSERT (que cria a membership do dono) rodar -
-- então "criar liga" quebrava com RLS na hora de devolver a linha criada.
-- Deixa o dono ver a propria liga direto, sem depender de league_members.
drop policy "members and requesters read their leagues" on public.leagues;

create policy "owner, members and requesters read their leagues"
  on public.leagues for select
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.league_members lm
      where lm.league_id = leagues.id and lm.user_id = auth.uid()
    )
  );
