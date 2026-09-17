import { Trophy, Crown, Flame, ShieldCheck, Globe, Target, Star } from 'lucide-react'

// Tipos calculados na RPC player_achievements (Etapa 11) - o rótulo, a
// descrição e o ícone em PT-BR ficam só aqui no client, a RPC só manda o
// tipo + contagem + data mais recente.
export interface AchievementMeta {
  label: string
  description: string
  icon: typeof Trophy
}

export const ACHIEVEMENT_META: Record<string, AchievementMeta> = {
  champion: {
    label: 'Campeão',
    description: 'Já foi campeão de uma edição',
    icon: Trophy,
  },
  back_to_back: {
    label: 'Bicampeão',
    description: 'Defendeu o título na edição seguinte do mesmo campeonato',
    icon: Crown,
  },
  hat_trick: {
    label: 'Hat-trick',
    description: 'Marcou 3 gols ou mais numa única partida',
    icon: Flame,
  },
  unbeaten_edition: {
    label: 'Invicto',
    description: 'Terminou uma edição sem perder nenhuma partida',
    icon: ShieldCheck,
  },
  mundial_champion: {
    label: 'Campeão mundial',
    description: 'Levantou a taça do Mundial',
    icon: Globe,
  },
  top_scorer_award: {
    label: 'Artilheiro',
    description: 'Foi o artilheiro de uma edição',
    icon: Target,
  },
  veteran: {
    label: 'Veterano',
    description: 'Disputou 10 edições ou mais',
    icon: Star,
  },
}

export const ACHIEVEMENT_ORDER = [
  'champion',
  'back_to_back',
  'mundial_champion',
  'top_scorer_award',
  'hat_trick',
  'unbeaten_edition',
  'veteran',
]
