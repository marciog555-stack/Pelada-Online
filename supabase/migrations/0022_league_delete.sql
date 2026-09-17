-- Dono da liga pode apagar a liga (e tudo que só existe dentro dela -
-- campeonatos, edições, participantes, partidas e membros já têm
-- ON DELETE CASCADE pra leagues.id). Vagas do Mundial que já usaram essa
-- liga (mundial_slots.league_id) NÃO têm cascade de propósito - preserva
-- o histórico do Mundial mesmo se a liga original for apagada, então a
-- exclusão falha com violação de FK nesse caso e a UI trata isso mostrando
-- uma mensagem específica em vez de deixar a liga sumir de um jeito que
-- quebraria a chave do Mundial.
create policy "owner deletes league"
  on public.leagues for delete
  using (owner_id = auth.uid());
