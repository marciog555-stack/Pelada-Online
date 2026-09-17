// Identidade visual por formato de competição: cada preset ganha um fundo
// e cores de destaque diferentes, evocando a "cara" da liga real que
// imita (sem reproduzir nenhum logo/escudo oficial - só a paleta, que é
// só um fato público). Sobrescreve as CSS custom properties do tema (ver
// styles.css) num wrapper local, então todo componente shadcn dentro
// (botões, badges, abas...) já herda automático, sem precisar tocar em
// cada um. Mata-mata simples não tem liga real associada - fica com o
// tema padrão do app.
export interface PresetTheme {
  background: string
  backgroundImage: string
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
    backgroundImage: theme.backgroundImage,
    '--background': theme.background,
    '--card': theme.card,
    '--primary': theme.primary,
    '--primary-foreground': theme.primaryForeground,
    '--border': theme.border,
    '--ring': theme.ring,
    '--accent': theme.accent,
  } as React.CSSProperties
}
