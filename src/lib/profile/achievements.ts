import { Crown, Flame, ShieldCheck, Target, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Tipos calculados na RPC player_achievements (Etapa 11) - o rótulo, a
// descrição e o ícone em PT-BR ficam só aqui no client, a RPC só manda o
// tipo + contagem + data mais recente.
//
// 'champion' e 'mundial_champion' não aparecem aqui: viraram taças de
// verdade na vitrine (trophy-rack-card.tsx), não faz sentido repetir como
// badge genérico.
export interface AchievementMeta {
  label: string
  description: string
  icon: LucideIcon
}

export const ACHIEVEMENT_META: Record<string, AchievementMeta> = {
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

export const ACHIEVEMENT_ORDER = ['back_to_back', 'top_scorer_award', 'hat_trick', 'unbeaten_edition', 'veteran']
