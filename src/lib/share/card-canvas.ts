import { initials } from '#/lib/text'

// Mesma paleta e tipografia do design system (ver src/styles.css), mas
// como cores/fontes fixas: o canvas é desenhado fora da árvore do DOM
// tematizado, então não há CSS custom properties pra ler aqui.
const COLORS = {
  bgTop: '#1a1f28',
  bgBottom: '#10131a',
  primary: '#00ff87',
  foreground: '#e1e2ec',
  muted: '#b9cbb9',
  gold: '#d4af37',
  goldLight: '#ffe08a',
  goldDark: '#b9800f',
  card: '#1d1f27',
  border: 'rgba(212, 175, 55, 0.35)',
}

const SIZE = 1080

async function loadImageSafe(url: string | null | undefined): Promise<HTMLImageElement | null> {
  if (!url) return null
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

async function ensureFonts() {
  await Promise.all([
    document.fonts.load('700 64px "Outfit"'),
    document.fonts.load('600 32px "Plus Jakarta Sans"'),
    document.fonts.load('500 24px "Plus Jakarta Sans"'),
  ])
  await document.fonts.ready
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, SIZE)
  gradient.addColorStop(0, COLORS.bgTop)
  gradient.addColorStop(1, COLORS.bgBottom)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SIZE, SIZE)
}

// Moldura sutil dourada - dá um acabamento de "certificado/conquista"
// sem pesar, condizente com o dourado ser reservado pra prestígio.
function drawFrame(ctx: CanvasRenderingContext2D) {
  const inset = 28
  const radius = 32
  ctx.save()
  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 2
  roundRectPath(ctx, inset, inset, SIZE - inset * 2, SIZE - inset * 2, radius)
  ctx.stroke()
  ctx.restore()
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawBrand(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.primary
  ctx.font = '600 30px "Plus Jakarta Sans"'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('PELADA ONLINE', SIZE / 2, 96)

  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(SIZE / 2 - 60, 118)
  ctx.lineTo(SIZE / 2 + 60, 118)
  ctx.stroke()
}

function drawCircleAvatar(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  fallbackLabel: string,
  cx: number,
  cy: number,
  radius: number,
) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.card
  ctx.fill()
  ctx.clip()
  if (img) {
    ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2)
  } else {
    ctx.fillStyle = COLORS.muted
    ctx.font = `700 ${Math.round(radius * 0.8)}px "Plus Jakarta Sans"`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(fallbackLabel, cx, cy)
  }
  ctx.restore()
  ctx.strokeStyle = COLORS.primary
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.textBaseline = 'alphabetic'
}

// Mesma silhueta de taça do componente TrophyCup (src/components/profile/trophy-cup.tsx),
// redesenhada com Path2D a partir do mesmo "d" de SVG - garante que o troféu
// do card de compartilhamento seja visualmente idêntico ao usado no app,
// em vez de recorrer a um emoji (que renderiza inconsistente entre plataformas).
const TROPHY_HANDLE_LEFT = new Path2D('M15 12 C4 12 3 27 13 32 C15.5 33.3 18 33.6 20 33.2')
const TROPHY_HANDLE_RIGHT = new Path2D('M49 12 C60 12 61 27 51 32 C48.5 33.3 46 33.6 44 33.2')
const TROPHY_CUP = new Path2D('M14 8 H50 V24 C50 40 39 47 32 47 C25 47 14 40 14 24 Z')
const TROPHY_SHINE = new Path2D('M20 12 C19 20 20 27 24 32')
const TROPHY_STEM = new Path2D('M29 47 H35 L37 58 H27 Z')
const TROPHY_BASE_1 = new Path2D('M18 58 H46 V63 H18 Z')
const TROPHY_BASE_2 = new Path2D('M13 64 H51 V70 H13 Z')

function drawTrophy(ctx: CanvasRenderingContext2D, cx: number, topY: number, scale: number) {
  ctx.save()
  ctx.translate(cx - 32 * scale, topY)
  ctx.scale(scale, scale)

  const gradient = ctx.createLinearGradient(0, 0, 0, 76)
  gradient.addColorStop(0, COLORS.goldLight)
  gradient.addColorStop(0.55, COLORS.gold)
  gradient.addColorStop(1, COLORS.goldDark)

  ctx.strokeStyle = gradient
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'
  ctx.stroke(TROPHY_HANDLE_LEFT)
  ctx.stroke(TROPHY_HANDLE_RIGHT)

  ctx.fillStyle = gradient
  ctx.fill(TROPHY_CUP)
  ctx.fill(TROPHY_STEM)
  ctx.fill(TROPHY_BASE_1)
  ctx.fill(TROPHY_BASE_2)

  ctx.strokeStyle = '#fff5d6'
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 2
  ctx.stroke(TROPHY_SHINE)
  ctx.globalAlpha = 1

  ctx.restore()
}

function drawStat(ctx: CanvasRenderingContext2D, x: number, y: number, value: string, label: string) {
  ctx.fillStyle = COLORS.gold
  ctx.font = '700 68px "Outfit"'
  ctx.textAlign = 'center'
  ctx.fillText(value, x, y)
  ctx.fillStyle = COLORS.muted
  ctx.font = '600 22px "Plus Jakarta Sans"'
  ctx.fillText(label, x, y + 34)
}

// Quebra os rótulos de conquista em linhas que cabem em maxWidth, juntando
// com " · " - usado no card do jogador pra caber as 7 conquistas possíveis
// sem estourar a largura do card.
function wrapLabels(ctx: CanvasRenderingContext2D, labels: string[], maxWidth: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const label of labels) {
    const candidate = current ? `${current}  ·  ${label}` : label
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current)
      current = label
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.muted
  ctx.font = '500 22px "Plus Jakarta Sans"'
  ctx.textAlign = 'center'
  ctx.fillText('pelada-online.app', SIZE / 2, SIZE - 56)
}

export interface PlayerCardData {
  displayName: string
  efootballId: string
  avatarUrl: string | null
  titles: number
  editionsPlayed: number
  achievementLabels: string[]
}

export async function drawPlayerShareCard(data: PlayerCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  await ensureFonts()
  const avatar = await loadImageSafe(data.avatarUrl)

  drawBackground(ctx)
  drawFrame(ctx)
  drawBrand(ctx)

  const avatarRadius = 120
  const avatarCy = 280
  drawCircleAvatar(ctx, avatar, initials(data.displayName), SIZE / 2, avatarCy, avatarRadius)

  ctx.fillStyle = COLORS.foreground
  ctx.font = '700 64px "Outfit"'
  ctx.textAlign = 'center'
  ctx.fillText(data.displayName, SIZE / 2, avatarCy + avatarRadius + 80)

  ctx.fillStyle = COLORS.muted
  ctx.font = '500 28px "Plus Jakarta Sans"'
  ctx.fillText(`@${data.efootballId}`, SIZE / 2, avatarCy + avatarRadius + 120)

  const statsY = avatarCy + avatarRadius + 230
  drawStat(ctx, SIZE / 2 - 200, statsY, String(data.titles), 'TÍTULOS')
  drawStat(ctx, SIZE / 2 + 200, statsY, String(data.editionsPlayed), 'EDIÇÕES')

  if (data.achievementLabels.length > 0) {
    ctx.font = '600 26px "Plus Jakarta Sans"'
    ctx.fillStyle = COLORS.gold
    ctx.textAlign = 'center'
    const lines = wrapLabels(ctx, data.achievementLabels, SIZE - 160)
    let lineY = statsY + 100
    for (const line of lines) {
      ctx.fillText(line, SIZE / 2, lineY)
      lineY += 44
    }
  }

  drawFooter(ctx)
  return canvas
}

export interface ChampionCardData {
  competitionName: string
  editionNumber: number
  championTeamName: string
  crestUrl: string | null
  runnerUpTeamName?: string | null
}

export async function drawChampionShareCard(data: ChampionCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  await ensureFonts()
  const crest = await loadImageSafe(data.crestUrl)

  drawBackground(ctx)
  drawFrame(ctx)
  drawBrand(ctx)

  ctx.fillStyle = COLORS.muted
  ctx.font = '600 28px "Plus Jakarta Sans"'
  ctx.textAlign = 'center'
  ctx.fillText(`${data.competitionName} · Edição ${data.editionNumber}`, SIZE / 2, 190, SIZE - 120)

  const crestRadius = 150
  drawCircleAvatar(ctx, crest, initials(data.championTeamName), SIZE / 2, 420, crestRadius)

  drawTrophy(ctx, SIZE / 2, 590, 1.4)

  ctx.fillStyle = COLORS.gold
  ctx.font = '600 26px "Plus Jakarta Sans"'
  ctx.textAlign = 'center'
  ctx.fillText('CAMPEÃO', SIZE / 2, 720)

  ctx.fillStyle = COLORS.foreground
  ctx.font = '700 76px "Outfit"'
  ctx.fillText(data.championTeamName, SIZE / 2, 800, SIZE - 100)

  if (data.runnerUpTeamName) {
    ctx.fillStyle = COLORS.muted
    ctx.font = '500 26px "Plus Jakarta Sans"'
    ctx.fillText(`Vice-campeão: ${data.runnerUpTeamName}`, SIZE / 2, 850, SIZE - 120)
  }

  drawFooter(ctx)
  return canvas
}

export interface MatchResultCardData {
  competitionName: string
  editionNumber: number
  homeTeamName: string
  homeCrestUrl: string | null
  awayTeamName: string
  awayCrestUrl: string | null
  homeGoals: number
  awayGoals: number
}

export async function drawMatchResultShareCard(data: MatchResultCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  await ensureFonts()
  const [homeCrest, awayCrest] = await Promise.all([
    loadImageSafe(data.homeCrestUrl),
    loadImageSafe(data.awayCrestUrl),
  ])

  drawBackground(ctx)
  drawFrame(ctx)
  drawBrand(ctx)

  ctx.fillStyle = COLORS.muted
  ctx.font = '600 28px "Plus Jakarta Sans"'
  ctx.textAlign = 'center'
  ctx.fillText(`${data.competitionName} · Edição ${data.editionNumber}`, SIZE / 2, 200, SIZE - 120)

  const crestRadius = 110
  const crestCy = 440

  // Mede o placar antes de posicionar os escudos, pra garantir espaço
  // suficiente entre eles mesmo com placares de dois dígitos (ex: "12 - 9").
  const scoreText = `${data.homeGoals} - ${data.awayGoals}`
  ctx.font = '700 88px "Outfit"'
  const scoreWidth = ctx.measureText(scoreText).width
  const crestOffset = scoreWidth / 2 + crestRadius + 40
  const homeCx = SIZE / 2 - crestOffset
  const awayCx = SIZE / 2 + crestOffset
  drawCircleAvatar(ctx, homeCrest, initials(data.homeTeamName), homeCx, crestCy, crestRadius)
  drawCircleAvatar(ctx, awayCrest, initials(data.awayTeamName), awayCx, crestCy, crestRadius)

  ctx.fillStyle = COLORS.foreground
  ctx.font = '700 88px "Outfit"'
  ctx.textAlign = 'center'
  ctx.fillText(`${data.homeGoals} - ${data.awayGoals}`, SIZE / 2, crestCy + 34)

  ctx.font = '600 32px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.foreground
  ctx.fillText(data.homeTeamName, homeCx, crestCy + crestRadius + 60, 300)
  ctx.fillText(data.awayTeamName, awayCx, crestCy + crestRadius + 60, 300)

  drawFooter(ctx)
  return canvas
}

export async function canvasToFile(canvas: HTMLCanvasElement, filename: string): Promise<File> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas_to_blob_failed'))), 'image/png')
  })
  return new File([blob], filename, { type: 'image/png' })
}

export async function shareOrDownloadFile(file: File, shareTitle: string, shareText: string) {
  const canNativeShare =
    'share' in navigator && 'canShare' in navigator && navigator.canShare({ files: [file] })
  if (canNativeShare) {
    try {
      await navigator.share({ files: [file], title: shareTitle, text: shareText })
      return
    } catch {
      // usuário cancelou o share nativo - cai pro download abaixo
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
