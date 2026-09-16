import type { Preset } from '../types'

export const brasileiraoSerieAPreset: Preset = {
  id: 'brasileirao-serie-a',
  name: 'Brasileirão Série A',
  seasonReference: '2024',
  sourceNote: 'Regulamento da CBF para a Série A: pontos corridos, turno e returno, 20 clubes.',
  stages: [
    {
      kind: 'round_robin',
      doubleRound: true,
      pointsSystem: { win: 3, draw: 1, loss: 0 },
      tiebreakCriteria: [
        'wins',
        'goal_difference',
        'goals_for',
        'head_to_head_points',
        'fewer_red_cards',
        'fewer_yellow_cards',
        'draw_lots',
      ],
      headToHeadOnlyForPairs: true,
    },
  ],
}
