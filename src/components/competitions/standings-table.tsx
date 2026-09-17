import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { RankedStandingRow } from '#/lib/competition-engine'
import type { TiebreakCriterionName } from '#/lib/competition-engine/types'
import type { Match } from '#/hooks/use-competitions'
import { TIEBREAK_LABELS, computeRecentForm } from '#/lib/competitions/stats'
import { cn } from '#/lib/utils'
import { initials } from '#/lib/text'

type ParticipantInfo = { team_name: string; crest_url: string | null; user_id: string }

const ZONE_THRESHOLD = 8
const TOP_ZONE_SIZE = 4
const BOTTOM_ZONE_SIZE = 4

const FORM_DOT_CLASS: Record<'V' | 'E' | 'D', string> = {
  V: 'bg-success',
  E: 'bg-muted-foreground/50',
  D: 'bg-destructive',
}

export function StandingsTable({
  rows,
  participants,
  criteria,
  matches,
  currentUserId,
}: {
  rows: RankedStandingRow[]
  participants: Map<string, ParticipantInfo>
  criteria: TiebreakCriterionName[]
  matches: Match[]
  currentUserId?: string
}) {
  const showZones = rows.length >= ZONE_THRESHOLD

  return (
    <div className="grid gap-2">
      {showZones && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-card/50 px-3 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-success" /> Ponta da tabela
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-destructive" /> Fim da tabela
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="w-8 py-2 pl-3 text-left font-normal">#</th>
              <th className="py-2 text-left font-normal">Time</th>
              <th className="w-8 py-2 text-center font-normal">J</th>
              <th className="w-8 py-2 text-center font-normal">V</th>
              <th className="w-8 py-2 text-center font-normal">E</th>
              <th className="w-8 py-2 text-center font-normal">D</th>
              <th className="w-10 py-2 text-center font-normal">SG</th>
              <th className="w-10 py-2 text-center font-normal">Pts</th>
              <th className="w-24 py-2 pr-3 text-center font-normal">Forma</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const participant = participants.get(row.participantId)
              const isMe = !!currentUserId && participant?.user_id === currentUserId
              const zone =
                showZones && row.position <= TOP_ZONE_SIZE
                  ? 'border-l-4 border-l-success'
                  : showZones && row.position > rows.length - BOTTOM_ZONE_SIZE
                    ? 'border-l-4 border-l-destructive'
                    : ''
              const form = computeRecentForm(row.participantId, matches)

              return (
                <tr
                  key={row.participantId}
                  className={cn(
                    'border-b border-border/60 last:border-0',
                    zone,
                    isMe && 'bg-primary/10 shadow-[inset_0_0_0_1px] shadow-primary/30',
                  )}
                >
                  <td className="py-2 pl-3 tabular-nums text-muted-foreground">{row.position}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      {participant?.crest_url ? (
                        <img
                          src={participant.crest_url}
                          alt=""
                          className="size-5 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-semibold">
                          {initials(participant?.team_name ?? '?')}
                        </div>
                      )}
                      <span className="truncate">{participant?.team_name ?? '—'}</span>
                      {isMe && (
                        <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground uppercase">
                          Você
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 text-center tabular-nums">{row.played}</td>
                  <td className="py-2 text-center tabular-nums">{row.wins}</td>
                  <td className="py-2 text-center tabular-nums">{row.draws}</td>
                  <td className="py-2 text-center tabular-nums">{row.losses}</td>
                  <td className="py-2 text-center tabular-nums">{row.goalDifference}</td>
                  <td className="py-2 text-center font-display tabular-nums">{row.points}</td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center justify-center gap-1">
                      {form.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                      {form.map((result, index) => (
                        <span
                          key={index}
                          title={result === 'V' ? 'Vitória' : result === 'E' ? 'Empate' : 'Derrota'}
                          className={cn('size-2 rounded-full', FORM_DOT_CLASS[result])}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <TiebreakExplainer criteria={criteria} />
    </div>
  )
}

function TiebreakExplainer({ criteria }: { criteria: TiebreakCriterionName[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-muted-foreground"
      >
        Critério de desempate
        <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ol className="mt-2 grid list-decimal gap-1 pl-4 text-foreground">
          {criteria.map((criterion, index) => (
            <li key={`${criterion}-${index}`}>{TIEBREAK_LABELS[criterion]}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
