import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { RankedStandingRow } from '#/lib/competition-engine'
import type { TiebreakCriterionName } from '#/lib/competition-engine/types'
import { TIEBREAK_LABELS } from '#/lib/competitions/stats'

type ParticipantInfo = { team_name: string; crest_url: string | null }

const ZONE_THRESHOLD = 8

export function StandingsTable({
  rows,
  participants,
  criteria,
}: {
  rows: RankedStandingRow[]
  participants: Map<string, ParticipantInfo>
  criteria: TiebreakCriterionName[]
}) {
  const showZones = rows.length >= ZONE_THRESHOLD

  return (
    <div className="grid gap-2">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="w-8 py-2 pl-3 text-left font-normal">#</th>
              <th className="py-2 text-left font-normal">Time</th>
              <th className="w-8 py-2 text-center font-normal">J</th>
              <th className="w-8 py-2 text-center font-normal">V</th>
              <th className="w-8 py-2 text-center font-normal">E</th>
              <th className="w-8 py-2 text-center font-normal">D</th>
              <th className="w-10 py-2 text-center font-normal">SG</th>
              <th className="w-10 py-2 pr-3 text-center font-normal">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const participant = participants.get(row.participantId)
              const zone =
                showZones && row.position <= 4
                  ? 'border-l-4 border-l-primary'
                  : showZones && row.position > rows.length - 4
                    ? 'border-l-4 border-l-destructive'
                    : ''
              return (
                <tr key={row.participantId} className={`border-b border-border/60 last:border-0 ${zone}`}>
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
                        <div className="size-5 shrink-0 rounded-full bg-secondary" />
                      )}
                      <span className="truncate">{participant?.team_name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="py-2 text-center tabular-nums">{row.played}</td>
                  <td className="py-2 text-center tabular-nums">{row.wins}</td>
                  <td className="py-2 text-center tabular-nums">{row.draws}</td>
                  <td className="py-2 text-center tabular-nums">{row.losses}</td>
                  <td className="py-2 text-center tabular-nums">{row.goalDifference}</td>
                  <td className="py-2 pr-3 text-center font-display tabular-nums">{row.points}</td>
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
