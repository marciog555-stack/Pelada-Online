# Motor de regras

Funções puras em TypeScript, sem dependência de React ou Supabase. Recebem dados (participantes, partidas, configuração de preset) e devolvem resultados (tabela ordenada, chaveamento) — quem lê/grava no banco e mostra na tela é responsabilidade de outra camada.

## Peças

- **`types.ts`** — `MatchResult`, `StandingRow`, `Preset` (uma competição é uma lista de `stages`: `round_robin` ou `knockout`).
- **`standings.ts`** — `computeBaseStats` (estatísticas cruas a partir das partidas) e `resolveStandings` (aplica os critérios de desempate em sequência, agrupando por empate a cada passo). `computeStandings` junta os dois: sempre ordena por pontos primeiro e garante `draw_lots` como último recurso, mesmo que o preset não liste explicitamente.
- **`knockout.ts`** — geração de chave de mata-mata com semeadura clássica (seed 1 só encontra seed 2 na final) e byes automáticos quando o número de participantes não é potência de 2.
- **`presets/`** — configuração de cada formato real. Nesta etapa: Brasileirão Série A e mata-mata simples. Os demais (europeus, Libertadores, formato suíço, divisões...) entram na Etapa 10.

## Confronto direto: "só entre dois" vs. mini-tabela

Alguns campeonatos (Brasileirão) só aplicam o confronto direto quando exatamente dois times estão empatados; com três ou mais, o critério é pulado e passa pro próximo da lista. Outros (La Liga) viram uma mini-tabela entre todos os empatados, não importa quantos. Isso é uma flag por preset (`headToHeadOnlyForPairs`), não por critério — os presets futuros com mini-tabela usam os mesmos critérios `head_to_head_*`, só com essa flag desligada.

## Sorteio (`draw_lots`)

Último critério, sempre garantido pelo `computeStandings`. Aceita um `random` injetável (`ResolveOptions.random`) só pra permitir testes determinísticos — isso não tem relação com o sorteio ao vivo do Mundial (Etapa 9), que é auditado no servidor com `crypto` e log da semente.
