import { brasileiraoSerieAPreset } from './brasileirao'
import { mataMataSimplesPreset } from './mata-mata-simples'
import { premierLeaguePreset } from './premier-league'
import { bundesligaPreset } from './bundesliga'
import { championsLeagueSwissPreset } from './champions-league-swiss'
import type { Preset } from '../types'

export { brasileiraoSerieAPreset } from './brasileirao'
export { mataMataSimplesPreset } from './mata-mata-simples'
export { premierLeaguePreset } from './premier-league'
export { bundesligaPreset } from './bundesliga'
export { championsLeagueSwissPreset } from './champions-league-swiss'

// Libertadores (fase de grupos + mata-mata) e "modo divisões"
// (promoção/rebaixamento entre edições) ficam de fora por enquanto -
// são mecânicas estruturalmente diferentes (grupos paralelos e
// continuidade entre temporadas), não só presets novos em cima do que
// já existe.
export const builtInPresets: Preset[] = [
  brasileiraoSerieAPreset,
  mataMataSimplesPreset,
  premierLeaguePreset,
  bundesligaPreset,
  championsLeagueSwissPreset,
]
