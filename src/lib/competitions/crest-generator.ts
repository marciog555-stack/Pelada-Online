import { initials } from '#/lib/text'

// Escudo automático e original (silhueta genérica + iniciais do time, na
// cor escolhida) - nunca reproduz o escudo oficial de nenhum clube, é só
// pra já ter algo visual assim que o participante entra, sem precisar
// subir imagem da galeria. Continua trocável a qualquer momento pelo
// fluxo normal de upload de escudo.
function relativeLuminance(hex: string): number {
  const channels = hex.replace('#', '').match(/.{2}/g)?.map((c) => parseInt(c, 16) / 255) ?? [0, 0, 0]
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function toDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

export function generateCrestDataUri(teamName: string, color: string): string {
  const label = initials(teamName) || '?'
  const textColor = relativeLuminance(color) > 0.5 ? '#111111' : '#ffffff'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path d="M32 4 L58 13 V30 C58 47 47 58 32 61 C17 58 6 47 6 30 V13 Z" fill="${color}" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>
    <text x="32" y="39" font-family="Outfit, sans-serif" font-size="22" font-weight="800" fill="${textColor}" text-anchor="middle">${label}</text>
  </svg>`

  return toDataUri(svg)
}
