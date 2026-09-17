export type SeasonStatus = 'upcoming' | 'active' | 'ended'

export function seasonStatus(season: { starts_at: string; ends_at: string }): SeasonStatus {
  const now = Date.now()
  const starts = new Date(season.starts_at).getTime()
  const ends = new Date(season.ends_at).getTime()
  if (now < starts) return 'upcoming'
  if (now > ends) return 'ended'
  return 'active'
}

export const SEASON_STATUS_LABELS: Record<SeasonStatus, string> = {
  upcoming: 'Em breve',
  active: 'Ativa',
  ended: 'Encerrada',
}

export function formatSeasonDateRange(startsAt: string, endsAt: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${fmt(startsAt)} - ${fmt(endsAt)}`
}
