-- Byes do mata-mata (seção 6.2/6.3) precisam de uma partida com um lado
-- só - quem tem bye já avança "confirmado" sem jogar. Isso exige que
-- home/away possam ser nulos (nunca os dois ao mesmo tempo).
alter table public.matches alter column home_participant_id drop not null;
alter table public.matches alter column away_participant_id drop not null;

alter table public.matches drop constraint different_participants;
alter table public.matches add constraint different_participants check (
  home_participant_id is null or away_participant_id is null or home_participant_id <> away_participant_id
);
alter table public.matches add constraint at_least_one_participant check (
  home_participant_id is not null or away_participant_id is not null
);
