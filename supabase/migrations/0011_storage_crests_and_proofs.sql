-- Bucket de escudos (público, caminho por usuário) e de prints de
-- resultado (privado, caminho por partida - assim a policy consegue
-- checar is_match_player/is_league_admin a partir do próprio path).
insert into storage.buckets (id, name, public)
values ('crests', 'crests', true)
on conflict (id) do nothing;

create policy "crest images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'crests');

create policy "users upload their own crests"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'crests' and (storage.foldername(name)) [1] = auth.uid()::text);

create policy "users update their own crests"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'crests' and (storage.foldername(name)) [1] = auth.uid()::text)
  with check (bucket_id = 'crests' and (storage.foldername(name)) [1] = auth.uid()::text);

insert into storage.buckets (id, name, public)
values ('match-proofs', 'match-proofs', false)
on conflict (id) do nothing;

create policy "match players upload proofs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'match-proofs' and public.is_match_player(((storage.foldername(name)) [1])::uuid));

create policy "match players and league admins read proofs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'match-proofs'
    and (
      public.is_match_player(((storage.foldername(name)) [1])::uuid)
      or public.is_league_admin(public.league_id_for_match(((storage.foldername(name)) [1])::uuid))
    )
  );
