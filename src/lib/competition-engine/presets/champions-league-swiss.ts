import type { Preset } from '../types'

export const championsLeagueSwissPreset: Preset = {
  id: 'champions-league-swiss',
  name: 'Champions League (fase de liga)',
  seasonReference: '2024/25',
  sourceNote:
    'Formato suíço adotado pela UEFA a partir de 2024/25: todo mundo joga um número fixo de rodadas contra adversários diferentes, pareados pela classificação a cada rodada, numa tabela só - sem mata-mata depois nesta versão.',
  stages: [
    {
      kind: 'swiss',
      rounds: 5,
      pointsSystem: { win: 3, draw: 1, loss: 0 },
      tiebreakCriteria: ['wins', 'goal_difference', 'goals_for', 'away_wins', 'fair_play_points', 'draw_lots'],
      headToHeadOnlyForPairs: true,
    },
  ],
}
