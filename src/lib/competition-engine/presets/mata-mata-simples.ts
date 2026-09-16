import type { Preset } from '../types'

export const mataMataSimplesPreset: Preset = {
  id: 'mata-mata-simples',
  name: 'Mata-mata simples',
  seasonReference: 'Genérico',
  sourceNote: 'Eliminação direta, jogo único. Byes automáticos quando o número de participantes não é potência de 2.',
  stages: [
    {
      kind: 'knockout',
      twoLegged: false,
      awayGoalsRule: false,
    },
  ],
}
