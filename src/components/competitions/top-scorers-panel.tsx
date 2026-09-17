import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { EmptyState } from '#/components/ui/empty-state'
import { Badge } from '#/components/ui/badge'
import { computeEditionScorers } from '#/lib/competitions/stats'
import type { EditionScorerRow } from '#/lib/competitions/stats'
import type { MatchEvent } from '#/hooks/use-competitions'
import { cn } from '#/lib/utils'
import { initials } from '#/lib/text'

type ParticipantInfo = { team_name: string; crest_url: string | null; user_id: string }
type Mode = 'goals' | 'assists'

const MODE_LABEL: Record<Mode, string> = { goals: 'Artilharia', assists: 'Assistências' }
const MODE_UNIT: Record<Mode, string> = { goals: 'gols', assists: 'assist.' }

export function TopScorersPanel({
  events,
  participants,
  currentUserId,
}: {
  events: MatchEvent[]
  participants: Map<string, ParticipantInfo>
  currentUserId?: string
}) {
  const [mode, setMode] = useState<Mode>('goals')
  const scorers = computeEditionScorers(events)

  if (scorers.length === 0) {
    return <EmptyState>Artilharia aparece quando houver gols registrados.</EmptyState>
  }

  const sorted = [...scorers].sort((a, b) =>
    mode === 'goals' ? b.goals - a.goals || b.assists - a.assists : b.assists - a.assists || b.goals - a.goals,
  )
  const podium = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  const myStats = currentUserId
    ? scorers.reduce(
        (acc, row) => {
          const participant = participants.get(row.participantId)
          if (participant?.user_id !== currentUserId) return acc
          return { goals: acc.goals + row.goals, assists: acc.assists + row.assists }
        },
        { goals: 0, assists: 0 },
      )
    : null

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1 text-sm">
        {(['goals', 'assists'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'rounded-lg py-1.5 font-medium transition-colors',
              mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      <Podium rows={podium} participants={participants} currentUserId={currentUserId} mode={mode} />

      {rest.length > 0 && (
        <div className="grid gap-2">
          {rest.map((row, index) => {
            const participant = participants.get(row.participantId)
            const isMe = currentUserId && participant?.user_id === currentUserId
            return (
              <div
                key={`${row.participantId}-${row.athleteName}`}
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-border bg-card p-3',
                  isMe && 'border-primary/40 bg-primary/5',
                )}
              >
                <span className="w-6 shrink-0 text-center text-xs text-muted-foreground tabular-nums">
                  {index + 4}º
                </span>
                {participant?.crest_url ? (
                  <img src={participant.crest_url} alt="" className="size-6 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-semibold">
                    {initials(participant?.team_name ?? '?')}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm">
                    {row.athleteName}
                    {isMe && (
                      <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground uppercase">
                        Você
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{participant?.team_name ?? '—'}</p>
                </div>
                <span className="font-display text-lg tabular-nums text-primary">
                  {mode === 'goals' ? row.goals : row.assists}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {myStats && (myStats.goals > 0 || myStats.assists > 0) && (
        <div className="grid gap-2 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium">Seu desempenho</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">Gols</p>
              <p className="font-display text-xl">{myStats.goals}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">Assistências</p>
              <p className="font-display text-xl">{myStats.assists}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PODIUM_ORDER = [1, 0, 2] as const
const PODIUM_BADGE: Record<number, string> = {
  0: 'bg-gold text-gold-foreground shadow-[0_0_12px_var(--gold)]',
  1: 'bg-secondary text-secondary-foreground',
  2: 'bg-muted text-muted-foreground',
}

function Podium({
  rows,
  participants,
  currentUserId,
  mode,
}: {
  rows: EditionScorerRow[]
  participants: Map<string, ParticipantInfo>
  currentUserId?: string
  mode: Mode
}) {
  if (rows.length === 0) return null

  return (
    <div className="grid grid-cols-3 items-end gap-2">
      {PODIUM_ORDER.filter((i) => rows[i]).map((i) => {
        const row = rows[i]
        const participant = participants.get(row.participantId)
        const isMe = currentUserId && participant?.user_id === currentUserId
        const value = mode === 'goals' ? row.goals : row.assists

        return (
          <div
            key={row.participantId + row.athleteName}
            className={cn(
              'grid justify-items-center gap-1 rounded-2xl border border-border bg-card p-3',
              i === 0 && 'pt-5 shadow-[0_0_20px_-6px_var(--gold)]',
            )}
          >
            <div className="relative">
              {participant?.crest_url ? (
                <img
                  src={participant.crest_url}
                  alt=""
                  className={cn('rounded-full object-cover', i === 0 ? 'size-14' : 'size-11')}
                />
              ) : (
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full bg-secondary font-semibold',
                    i === 0 ? 'size-14 text-base' : 'size-11 text-sm',
                  )}
                >
                  {initials(participant?.team_name ?? '?')}
                </div>
              )}
              <span
                className={cn(
                  'absolute -top-2 -left-2 flex size-6 items-center justify-center rounded-full text-xs font-bold',
                  PODIUM_BADGE[i],
                )}
              >
                {i + 1}º
              </span>
              {i === 0 && (
                <Trophy className="absolute -top-4 left-1/2 size-4 -translate-x-1/2 text-gold" fill="currentColor" />
              )}
            </div>
            <p className="w-full truncate text-center text-xs font-medium">{row.athleteName}</p>
            <p className="w-full truncate text-center text-[10px] text-muted-foreground">
              {participant?.team_name ?? '—'}
            </p>
            {isMe && (
              <Badge variant="default" className="text-[9px]">
                Você
              </Badge>
            )}
            <p className="font-display text-lg leading-none text-primary">
              {value} <span className="text-[10px] font-normal text-muted-foreground">{MODE_UNIT[mode]}</span>
            </p>
          </div>
        )
      })}
    </div>
  )
}
