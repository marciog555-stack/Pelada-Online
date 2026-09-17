-- Etapa 10: presets adicionais (Premier League, Bundesliga, Champions
-- League no formato suíço). O motor de regras já sabe gerar esses
-- presets em TS puro; aqui só liberamos os novos preset_id no banco.
alter table public.competitions drop constraint competitions_preset_id_check;
alter table public.competitions
  add constraint competitions_preset_id_check
  check (preset_id in (
    'brasileirao-serie-a',
    'mata-mata-simples',
    'premier-league',
    'bundesliga',
    'champions-league-swiss'
  ));
