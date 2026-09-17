import type { Preset } from '../types'

export const bundesligaPreset: Preset = {
  id: 'bundesliga',
  name: 'Bundesliga',
  seasonReference: '2024/25',
  sourceNote:
    'Regulamento da DFL para a Bundesliga: pontos corridos, turno e returno, 18 clubes. Cadeia de desempate longa - confronto direto, depois gols fora em confronto direto, depois aproveitamento fora de casa.',
  stages: [
    {
      kind: 'round_robin',
      doubleRound: true,
      pointsSystem: { win: 3, draw: 1, loss: 0 },
      tiebreakCriteria: [
        'goal_difference',
        'goals_for',
        'head_to_head_points',
        'head_to_head_goal_difference',
        'head_to_head_away_goals',
        'away_goals_for',
        'draw_lots',
      ],
      headToHeadOnlyForPairs: true,
    },
  ],
}
