// Motor de regras: funções puras, sem React/Supabase. Ver README.md desta pasta.

export interface MatchResult {
  id: string
  homeParticipantId: string
  awayParticipantId: string
  homeGoals: number
  awayGoals: number
  homeRedCards?: number
  awayRedCards?: number
  homeYellowCards?: number
  awayYellowCards?: number
}

export interface StandingRow {
  participantId: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  awayWins: number
  awayGoalsFor: number
  redCards: number
  yellowCards: number
}

export interface RankedStandingRow extends StandingRow {
  position: number
}

export interface PointsSystem {
  win: number
  draw: number
  loss: number
}

// opponents_* (Buchholz) e playoff_match (desempate por partida extra, que
// muda a própria forma de resolveStandings) ficam de fora por enquanto -
// não tem preset embutido que precise deles ainda.
export type TiebreakCriterionName =
  | 'points'
  | 'wins'
  | 'goal_difference'
  | 'goals_for'
  | 'head_to_head_points'
  | 'head_to_head_goal_difference'
  | 'head_to_head_goals_for'
  | 'fewer_red_cards'
  | 'fewer_yellow_cards'
  | 'away_wins'
  | 'away_goals_for'
  | 'head_to_head_away_goals'
  | 'fair_play_points'
  | 'draw_lots'

export interface RoundRobinStageConfig {
  kind: 'round_robin'
  doubleRound: boolean
  pointsSystem: PointsSystem
  tiebreakCriteria: TiebreakCriterionName[]
  headToHeadOnlyForPairs: boolean
}

export interface KnockoutStageConfig {
  kind: 'knockout'
  twoLegged: boolean
  awayGoalsRule: boolean
}

// Liga suíça (formato novo da Champions League): todo mundo joga um
// número fixo de rodadas contra adversários diferentes (sem tabela fixa
// de antemão - cada rodada é pareada pela classificação até ali), numa
// tabela só. Termina numa classificação final, igual pontos corridos -
// não tem chave eliminatória depois disso nesta versão.
export interface SwissStageConfig {
  kind: 'swiss'
  rounds: number
  pointsSystem: PointsSystem
  tiebreakCriteria: TiebreakCriterionName[]
  headToHeadOnlyForPairs: boolean
}

export type StageConfig = RoundRobinStageConfig | KnockoutStageConfig | SwissStageConfig

export interface Preset {
  id: string
  name: string
  seasonReference: string
  sourceNote: string
  stages: StageConfig[]
}
