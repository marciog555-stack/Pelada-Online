-- "Sem resposta em 24h: confirma automaticamente" (seção 7). Roda a
-- cada 15 minutos e só mexe em partidas realmente vencidas.
create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'auto-confirm-overdue-matches',
  '*/15 * * * *',
  $$select public.auto_confirm_overdue_matches();$$
);
