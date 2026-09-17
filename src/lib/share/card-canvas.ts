import { initials } from '#/lib/text'

// Cores fixas (não lidas de CSS var) porque o canvas é desenhado fora da
// árvore do DOM tematizado - mesma paleta de src/styles.css (tema único,
// escuro).
const COLORS = {
  bgTop: '#0a0e13',
  bgBottom: '#141b23',
  primary: '#33e58c',
  foreground: '#f5f8f7',
  muted: '#8996a3',
  gold: '#f0b429',
  card: '#1e2833',
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
    document.fonts.load('400 64px "Bebas Neue"'),
    document.fonts.load('600 32px "Inter"'),
    document.fonts.load('500 24px "Inter"'),
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

function drawBrand(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.primary
  ctx.font = '600 30px Inter'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('PELADA ONLINE', SIZE / 2, 84)
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
    ctx.font = `700 ${Math.round(radius * 0.8)}px Inter`
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

function drawStat(ctx: CanvasRenderingContext2D, x: number, y: number, value: string, label: string) {
  ctx.fillStyle = COLORS.gold
  ctx.font = '400 68px "Bebas Neue"'
  ctx.textAlign = 'center'
  ctx.fillText(value, x, y)
  ctx.fillStyle = COLORS.muted
  ctx.font = '600 22px Inter'
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
  ctx.font = '500 22px Inter'
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
  drawBrand(ctx)

  const avatarRadius = 120
  const avatarCy = 260
  drawCircleAvatar(ctx, avatar, initials(data.displayName), SIZE / 2, avatarCy, avatarRadius)

  ctx.fillStyle = COLORS.foreground
  ctx.font = '400 64px "Bebas Neue"'
  ctx.textAlign = 'center'
  ctx.fillText(data.displayName, SIZE / 2, avatarCy + avatarRadius + 80)

  ctx.fillStyle = COLORS.muted
  ctx.font = '500 28px Inter'
  ctx.fillText(`@${data.efootballId}`, SIZE / 2, avatarCy + avatarRadius + 120)

  const statsY = avatarCy + avatarRadius + 230
  drawStat(ctx, SIZE / 2 - 200, statsY, String(data.titles), 'TÍTULOS')
  drawStat(ctx, SIZE / 2 + 200, statsY, String(data.editionsPlayed), 'EDIÇÕES')

  if (data.achievementLabels.length > 0) {
    ctx.font = '600 26px Inter'
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
  drawBrand(ctx)

  ctx.fillStyle = COLORS.muted
  ctx.font = '600 28px Inter'
  ctx.textAlign = 'center'
  ctx.fillText(`${data.competitionName} · Edição ${data.editionNumber}`, SIZE / 2, 170, SIZE - 120)

  const crestRadius = 150
  drawCircleAvatar(ctx, crest, initials(data.championTeamName), SIZE / 2, 400, crestRadius)

  ctx.fillStyle = COLORS.gold
  ctx.font = '500 26px Inter'
  ctx.textAlign = 'center'
  ctx.fillText('🏆 CAMPEÃO', SIZE / 2, 610)

  ctx.fillStyle = COLORS.foreground
  ctx.font = '400 76px "Bebas Neue"'
  ctx.fillText(data.championTeamName, SIZE / 2, 690, SIZE - 100)

  if (data.runnerUpTeamName) {
    ctx.fillStyle = COLORS.muted
    ctx.font = '500 26px Inter'
    ctx.fillText(`Vice-campeão: ${data.runnerUpTeamName}`, SIZE / 2, 760, SIZE - 120)
  }

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
