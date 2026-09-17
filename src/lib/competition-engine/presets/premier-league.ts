import type { Preset } from '../types'

export const premierLeaguePreset: Preset = {
  id: 'premier-league',
  name: 'Premier League',
  seasonReference: '2024/25',
  sourceNote:
    'Regulamento da Premier League: pontos corridos, turno e returno, 20 clubes. Sem confronto direto - desempate vai direto pro saldo de gols.',
  stages: [
    {
      kind: 'round_robin',
      doubleRound: true,
      pointsSystem: { win: 3, draw: 1, loss: 0 },
      tiebreakCriteria: ['goal_difference', 'goals_for', 'away_wins', 'fewer_red_cards', 'fewer_yellow_cards', 'draw_lots'],
      headToHeadOnlyForPairs: true,
    },
  ],
}
