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
    background: '#071510',
    backgroundImage: 'linear-gradient(180deg, #0d2818 0%, #071510 55%, #050d07 100%)',
    card: '#102a1b',
    primary: '#1fae57',
    primaryForeground: '#052b13',
    border: '#1c3a28',
    ring: '#1fae57',
    accent: '#f2c14e',
  },
  'premier-league': {
    background: '#180b28',
    backgroundImage: 'linear-gradient(180deg, #2a1245 0%, #180b28 55%, #0d0616 100%)',
    card: '#251236',
    primary: '#8b3bf9',
    primaryForeground: '#ffffff',
    border: '#3a2154',
    ring: '#8b3bf9',
    accent: '#ff2882',
  },
  bundesliga: {
    background: '#190909',
    backgroundImage: 'linear-gradient(180deg, #2b0d0d 0%, #190909 55%, #0d0505 100%)',
    card: '#2a1010',
    primary: '#e2001a',
    primaryForeground: '#ffffff',
    border: '#3d1414',
    ring: '#e2001a',
    accent: '#f5d100',
  },
  'champions-league-swiss': {
    background: '#080d24',
    backgroundImage: 'linear-gradient(180deg, #101c3d 0%, #080d24 55%, #030512 100%)',
    card: '#111e40',
    primary: '#3f63ff',
    primaryForeground: '#ffffff',
    border: '#1c2c5c',
    ring: '#3f63ff',
    accent: '#9fb4ff',
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
