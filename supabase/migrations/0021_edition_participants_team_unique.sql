-- Ninguém pode entrar numa edição com o mesmo nome de time que alguém já
-- está usando ali - trava no banco (contra corrida entre dois cliques
-- quase simultâneos) o que o formulário já filtra na UI ao restringir aos
-- times ainda livres do catálogo da liga daquele preset.
alter table public.edition_participants
  add constraint edition_participants_edition_id_team_name_key unique (edition_id, team_name);
