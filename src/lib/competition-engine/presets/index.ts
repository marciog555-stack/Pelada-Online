import { brasileiraoSerieAPreset } from './brasileirao'
import { mataMataSimplesPreset } from './mata-mata-simples'
import type { Preset } from '../types'

export { brasileiraoSerieAPreset } from './brasileirao'
export { mataMataSimplesPreset } from './mata-mata-simples'

// Demais presets (europeus, Libertadores, formato suíço, divisões...)
// entram na Etapa 10.
export const builtInPresets: Preset[] = [brasileiraoSerieAPreset, mataMataSimplesPreset]
