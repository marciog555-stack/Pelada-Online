// Identidade visual do Mundial: o evento mais prestigioso da plataforma
// ganha um clima dourado/noturno próprio, diferente do tema padrão do
// app e das identidades por preset (ver preset-theme.ts) - mas sem
// reproduzir taças/logos oficiais de nenhuma confederação real. A cor
// de ação continua verde (--primary não é sobrescrito aqui): o dourado
// fica só no fundo e nos detalhes, reservado pra sensação de conquista.
const MUNDIAL_BACKGROUND = '#0d0904'
const MUNDIAL_BACKGROUND_IMAGE = 'linear-gradient(180deg, #1c1206 0%, #0d0904 55%, #050301 100%)'

const MUNDIAL_TEXTURE =
  'radial-gradient(circle at 10% 12%, rgba(212,175,55,0.85) 0px, rgba(212,175,55,0.85) 1px, transparent 1.6px), ' +
  'radial-gradient(circle at 26% 42%, rgba(212,175,55,0.5) 0px, rgba(212,175,55,0.5) 1.2px, transparent 1.8px), ' +
  'radial-gradient(circle at 40% 15%, rgba(212,175,55,0.7) 0px, rgba(212,175,55,0.7) 1px, transparent 1.6px), ' +
  'radial-gradient(circle at 55% 58%, rgba(212,175,55,0.4) 0px, rgba(212,175,55,0.4) 1.4px, transparent 2px), ' +
  'radial-gradient(circle at 68% 25%, rgba(212,175,55,0.75) 0px, rgba(212,175,55,0.75) 1px, transparent 1.6px), ' +
  'radial-gradient(circle at 80% 50%, rgba(212,175,55,0.5) 0px, rgba(212,175,55,0.5) 1.2px, transparent 1.8px), ' +
  'radial-gradient(circle at 92% 20%, rgba(212,175,55,0.6) 0px, rgba(212,175,55,0.6) 1px, transparent 1.6px), ' +
  'radial-gradient(circle at 18% 72%, rgba(212,175,55,0.4) 0px, rgba(212,175,55,0.4) 1px, transparent 1.6px), ' +
  'radial-gradient(circle at 62% 82%, rgba(212,175,55,0.65) 0px, rgba(212,175,55,0.65) 1.2px, transparent 1.8px), ' +
  'radial-gradient(circle at 88% 78%, rgba(212,175,55,0.5) 0px, rgba(212,175,55,0.5) 1px, transparent 1.6px), ' +
  'radial-gradient(circle at 50% 3%, rgba(212,175,55,0.16), transparent 45%)'

export function mundialThemeStyle(): React.CSSProperties {
  return {
    backgroundImage: `${MUNDIAL_TEXTURE}, ${MUNDIAL_BACKGROUND_IMAGE}`,
    '--background': MUNDIAL_BACKGROUND,
    '--card': '#1a1207',
    '--border': 'rgba(212, 175, 55, 0.2)',
  } as React.CSSProperties
}
