import type { PositionHistoryPoint } from '#/lib/competitions/stats'

const WIDTH = 300
const HEIGHT = 60
const MAX_POINTS = 10

export function PositionEvolutionChart({
  points,
  totalParticipants,
  teamName,
}: {
  points: PositionHistoryPoint[]
  totalParticipants: number
  teamName: string
}) {
  const displayPoints = points.slice(-MAX_POINTS)
  if (displayPoints.length < 2 || totalParticipants < 2) return null

  const stepX = WIDTH / (displayPoints.length - 1)
  const scaleY = (position: number) =>
    8 + ((position - 1) / (totalParticipants - 1)) * (HEIGHT - 16)

  const coords = displayPoints.map((p, i) => ({ x: i * stepX, y: scaleY(p.position) }))
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const areaPath = `${linePath} L${coords[coords.length - 1].x},${HEIGHT} L0,${HEIGHT} Z`
  const current = displayPoints[displayPoints.length - 1]

  return (
    <div className="grid gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Evolução de {teamName}</p>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
          {current.position}º agora
        </span>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-16 w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="position-evolution-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#position-evolution-gradient)" />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
        {coords.map((c, i) => {
          const isLast = i === coords.length - 1
          return (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={isLast ? 4 : 2.5}
              fill={isLast ? 'white' : 'var(--primary)'}
              stroke={isLast ? 'var(--primary)' : 'none'}
              strokeWidth={isLast ? 2 : 0}
            />
          )
        })}
      </svg>

      <div className="flex justify-between text-[10px] text-muted-foreground">
        {displayPoints.map((p) => (
          <span key={p.round}>R{p.round}</span>
        ))}
      </div>
    </div>
  )
}
