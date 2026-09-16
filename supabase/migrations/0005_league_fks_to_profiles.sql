-- Aponta as FKs de usuario para public.profiles em vez de auth.users:
-- profiles.id ja e 1:1 com auth.users.id (criado no signup), e assim o
-- PostgREST consegue fazer embed (leagues.owner:profiles(...),
-- league_members.profile:profiles(...)) sem gambiarra no client.
alter table public.leagues
  drop constraint leagues_owner_id_fkey,
  add constraint leagues_owner_id_fkey foreign key (owner_id) references public.profiles (id);

alter table public.league_members
  drop constraint league_members_user_id_fkey,
  add constraint league_members_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade;
