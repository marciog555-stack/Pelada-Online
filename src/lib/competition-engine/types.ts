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

// Critérios implementados nesta etapa (Brasileirão + mata-mata simples).
// away_*, opponents_*, playoff_match, fair_play_points, head_to_head_away_goals
// entram na Etapa 10 junto dos presets que os usam (europeus, formato suíço).
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

export type StageConfig = RoundRobinStageConfig | KnockoutStageConfig

export interface Preset {
  id: string
  name: string
  seasonReference: string
  sourceNote: string
  stages: StageConfig[]
}
