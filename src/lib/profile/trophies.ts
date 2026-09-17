// Vitrine de taças: uma taça por FORMATO de competição (preset), mais o
// Mundial (que não é um preset - é o torneio global entre campeões de
// liga da Etapa 8/9). Organizado em pirâmide por relevância: quem está
// mais acima e maior é mais disputado/prestigioso.
export interface TrophyDef {
  key: string // 'mundial' ou um preset_id de competitions.preset_id
  label: string
}

export const TROPHY_ROWS: TrophyDef[][] = [
  [{ key: 'mundial', label: 'Mundial' }],
  [{ key: 'champions-league-swiss', label: 'Champions League' }],
  [
    { key: 'premier-league', label: 'Premier League' },
    { key: 'brasileirao-serie-a', label: 'Brasileirão' },
    { key: 'bundesliga', label: 'Bundesliga' },
  ],
  [{ key: 'mata-mata-simples', label: 'Mata-mata' }],
]

// Tamanho da taça por linha (maior em cima, encolhendo conforme desce -
// é isso que dá a leitura de pirâmide, já que a linha 3 tem 3 taças lado
// a lado e não daria pra ler como "mais larga" se fossem do mesmo tamanho
// das de cima).
export const TROPHY_ROW_SIZE = [96, 80, 60, 52]
