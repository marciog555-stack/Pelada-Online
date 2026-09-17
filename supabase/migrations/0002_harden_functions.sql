-- Endurece funcoes: search_path fixo e remove exposicao desnecessaria
-- de funcoes internas via PostgREST RPC.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- handle_new_user roda via trigger (SECURITY DEFINER), nao precisa ser
-- chamavel diretamente por anon/authenticated via /rest/v1/rpc/.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- is_platform_admin so importa para avaliar policies do role "authenticated";
-- anon nao tem policies que dependam dela.
revoke execute on function public.is_platform_admin() from public, anon;
