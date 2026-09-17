// Identidade visual por formato de competição: cada preset ganha um fundo,
// uma textura gráfica original (padrões geométricos feitos só de
// gradientes CSS - nunca escudo, logo ou troféu oficial) e cores de
// destaque diferentes, evocando a "cara" da liga real que imita sem
// reproduzir nenhuma marca protegida. Sobrescreve as CSS custom
// properties do tema (ver styles.css) num wrapper local, então todo
// componente shadcn dentro (botões, badges, abas...) já herda automático,
// sem precisar tocar em cada um. Mata-mata simples não tem liga real
// associada - fica com o tema padrão do app.
export interface PresetTheme {
  background: string
  backgroundImage: string
  /** Padrão gráfico original (gradientes CSS), desenhado por cima do backgroundImage. */
  texture: string
  card: string
  primary: string
  primaryForeground: string
  border: string
  ring: string
  accent: string
}

export const PRESET_THEMES: Partial<Record<string, PresetTheme>> = {
  'brasileirao-serie-a': {
    background: '#050d08',
    backgroundImage: 'linear-gradient(180deg, #0a1f12 0%, #050d08 55%, #030805 100%)',
    // Listras de grama cortada (como um gramado real visto de cima) + brilho dourado no círculo central.
    texture:
      'repeating-linear-gradient(180deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 34px, transparent 34px, transparent 68px), ' +
      'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.10), transparent 42%)',
    card: '#0d1f14',
    primary: '#22c55e',
    primaryForeground: '#052012',
    border: 'rgba(34, 197, 94, 0.16)',
    ring: '#22c55e',
    accent: '#d4af37',
  },
  'premier-league': {
    background: '#0a0518',
    backgroundImage: 'linear-gradient(180deg, #180a2e 0%, #0a0518 55%, #05030d 100%)',
    // Geometria circular: anéis concêntricos sutis + dois halos de cor nos cantos.
    texture:
      'repeating-radial-gradient(circle at 50% 45%, transparent 0px, transparent 44px, rgba(255,255,255,0.028) 45px, rgba(255,255,255,0.028) 46px), ' +
      'radial-gradient(circle at 10% 6%, rgba(236,72,153,0.16), transparent 30%), ' +
      'radial-gradient(circle at 92% 94%, rgba(139,92,246,0.18), transparent 38%)',
    card: '#150b28',
    primary: '#8b5cf6',
    primaryForeground: '#ffffff',
    border: 'rgba(139, 92, 246, 0.18)',
    ring: '#8b5cf6',
    accent: '#ec4899',
  },
  bundesliga: {
    background: '#100505',
    backgroundImage: 'linear-gradient(180deg, #200a0a 0%, #100505 55%, #080303 100%)',
    // Cortes diagonais agressivos, vermelho denso + dourado esparso.
    texture:
      'repeating-linear-gradient(115deg, rgba(239,68,68,0.12) 0px, rgba(239,68,68,0.12) 3px, transparent 3px, transparent 44px), ' +
      'repeating-linear-gradient(115deg, rgba(245,209,0,0.07) 0px, rgba(245,209,0,0.07) 2px, transparent 2px, transparent 88px)',
    card: '#1c0a0a',
    primary: '#ef4444',
    primaryForeground: '#200404',
    border: 'rgba(239, 68, 68, 0.18)',
    ring: '#ef4444',
    accent: '#f5d100',
  },
  'champions-league-swiss': {
    background: '#050818',
    backgroundImage: 'linear-gradient(180deg, #0b1230 0%, #050818 55%, #02040d 100%)',
    // Céu estrelado + halo de luz vindo do topo (constelação e iluminação, sem estrelas oficiais).
    texture:
      'radial-gradient(circle at 8% 14%, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 1px, transparent 1.6px), ' +
      'radial-gradient(circle at 21% 40%, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1.2px, transparent 1.8px), ' +
      'radial-gradient(circle at 34% 11%, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 1px, transparent 1.6px), ' +
      'radial-gradient(circle at 47% 57%, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1.4px, transparent 2px), ' +
      'radial-gradient(circle at 61% 23%, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 1px, transparent 1.6px), ' +
      'radial-gradient(circle at 73% 49%, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1.2px, transparent 1.8px), ' +
      'radial-gradient(circle at 87% 17%, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1.6px), ' +
      'radial-gradient(circle at 14% 67%, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1.6px), ' +
      'radial-gradient(circle at 57% 79%, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 1.2px, transparent 1.8px), ' +
      'radial-gradient(circle at 81% 73%, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1.6px), ' +
      'radial-gradient(circle at 29% 88%, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1.6px), ' +
      'radial-gradient(circle at 94% 46%, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1.6px), ' +
      'radial-gradient(circle at 50% 4%, rgba(63,99,255,0.2), transparent 45%)',
    card: '#0c1330',
    primary: '#3f63ff',
    primaryForeground: '#ffffff',
    border: 'rgba(63, 99, 255, 0.2)',
    ring: '#3f63ff',
    accent: '#d4af37',
  },
}

export function presetThemeStyle(presetId: string | undefined): React.CSSProperties | undefined {
  const theme = presetId ? PRESET_THEMES[presetId] : undefined
  if (!theme) return undefined
  return {
    backgroundImage: `${theme.texture}, ${theme.backgroundImage}`,
    '--background': theme.background,
    '--card': theme.card,
    '--primary': theme.primary,
    '--primary-foreground': theme.primaryForeground,
    '--border': theme.border,
    '--ring': theme.ring,
    '--accent': theme.accent,
  } as React.CSSProperties
}
