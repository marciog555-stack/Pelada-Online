-- Etapa 5: a tabela/estatísticas ao vivo dependem de uma subscription
-- postgres_changes em "matches" (ver useEditionRealtime) - sem adicionar a
-- tabela na publication do Realtime, o client nunca recebe os eventos
-- (a RLS de "matches" já existe desde a Etapa 4 e continua valendo aqui).
alter publication supabase_realtime add table public.matches;
