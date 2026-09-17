-- Etapa 1: cadastro/login com ID do eFootball, perfil público.
-- Login usa Supabase Auth com um e-mail sintético gerado a partir do
-- efootball_id (dominio ".invalid", nunca exposto na UI). Ver
-- src/lib/auth/efootball-email.ts para a constante do dominio.

create extension if not exists citext;

-- ---------------------------------------------------------------------
-- profiles: dados públicos do jogador (visível a qualquer usuário logado)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  efootball_id citext not null unique,
  display_name text not null,
  nickname text,
  avatar_url text,
  platform text not null check (platform in ('ps', 'xbox', 'pc', 'mobile')),
  state text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint efootball_id_format check (efootball_id ~ '^[A-Za-z0-9_.-]{3,24}$')
);

comment on table public.profiles is 'Perfil publico do jogador. O ID do eFootball e a identidade do jogador na plataforma.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- profile_contacts: celular/WhatsApp. Nunca publico - so o dono le/edita.
-- Usado para recuperacao de senha e para evitar contas duplicadas.
-- ---------------------------------------------------------------------
create table public.profile_contacts (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text not null unique,
  created_at timestamptz not null default now(),
  constraint phone_format check (phone ~ '^[0-9]{10,15}$')
);

comment on table public.profile_contacts is 'Celular/WhatsApp do jogador. Privado: nunca exposto no perfil publico.';

alter table public.profile_contacts enable row level security;

create policy "users manage their own contact info"
  on public.profile_contacts for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- platform_admins: admins da plataforma. Sem policies = so service_role
-- (bypassa RLS) le/escreve. Promover alguem = insert manual por um admin.
-- ---------------------------------------------------------------------
create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins pa where pa.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- efootball_id_claims: fluxo "Esse ID e meu" (contestacao de ID em uso)
-- ---------------------------------------------------------------------
create table public.efootball_id_claims (
  id uuid primary key default gen_random_uuid(),
  claimant_id uuid not null references auth.users (id) on delete cascade,
  target_profile_id uuid not null references public.profiles (id) on delete cascade,
  efootball_id citext not null,
  proof_image_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users (id)
);

comment on table public.efootball_id_claims is 'Contestacao "esse ID e meu": jogador envia print do perfil no jogo para o admin da plataforma analisar.';

alter table public.efootball_id_claims enable row level security;

create policy "claimant and admins read claims"
  on public.efootball_id_claims for select
  to authenticated
  using (auth.uid() = claimant_id or public.is_platform_admin());

create policy "claimant creates own claim"
  on public.efootball_id_claims for insert
  to authenticated
  with check (auth.uid() = claimant_id);

create policy "admins resolve claims"
  on public.efootball_id_claims for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- ---------------------------------------------------------------------
-- Disponibilidade de ID/celular checada no cadastro, antes do signUp
-- (usuario ainda nao autenticado). Retornam so um boolean, sem vazar dado.
-- ---------------------------------------------------------------------
create or replace function public.is_efootball_id_available(p_efootball_id citext)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles p where p.efootball_id = p_efootball_id
  );
$$;

grant execute on function public.is_efootball_id_available(citext) to anon, authenticated;

create or replace function public.is_phone_available(p_phone text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profile_contacts c where c.phone = p_phone
  );
$$;

grant execute on function public.is_phone_available(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Cria profiles + profile_contacts automaticamente ao registrar no
-- Supabase Auth (metadata enviada pelo formulario de cadastro).
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := new.raw_user_meta_data;
begin
  insert into public.profiles (id, efootball_id, display_name, nickname, platform, state, city)
  values (
    new.id,
    meta ->> 'efootball_id',
    coalesce(meta ->> 'display_name', meta ->> 'efootball_id'),
    nullif(meta ->> 'nickname', ''),
    coalesce(meta ->> 'platform', 'pc'),
    nullif(meta ->> 'state', ''),
    nullif(meta ->> 'city', '')
  );

  insert into public.profile_contacts (id, phone)
  values (new.id, meta ->> 'phone');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Storage: avatares (publico) e prints de contestacao de ID (privado)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name)) [1] = auth.uid()::text);

create policy "users update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name)) [1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name)) [1] = auth.uid()::text);

create policy "users delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name)) [1] = auth.uid()::text);

insert into storage.buckets (id, name, public)
values ('id-claim-proofs', 'id-claim-proofs', false)
on conflict (id) do nothing;

create policy "users upload their own id claim proof"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'id-claim-proofs' and (storage.foldername(name)) [1] = auth.uid()::text);

create policy "owner or admin reads id claim proof"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'id-claim-proofs'
    and ((storage.foldername(name)) [1] = auth.uid()::text or public.is_platform_admin())
  );
