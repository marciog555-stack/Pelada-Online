import { Goal as GoalIcon, Square } from 'lucide-react'
import type { MatchEvent } from '#/hooks/use-competitions'

const EVENT_ICONS = {
  goal: GoalIcon,
  yellow_card: Square,
  red_card: Square,
}

const EVENT_COLORS = {
  goal: 'text-primary',
  yellow_card: 'text-yellow-400',
  red_card: 'text-destructive',
}

export function MatchEventsList({
  events,
  home,
  away,
}: {
  events: MatchEvent[]
  home: { id: string; team_name: string } | null
  away: { id: string; team_name: string } | null
}) {
  if (events.length === 0) return null

  return (
    <div className="grid gap-1.5">
      {events.map((event) => {
        const Icon = EVENT_ICONS[event.event_type as keyof typeof EVENT_ICONS]
        const teamName = event.participant_id === home?.id ? home.team_name : away?.team_name
        return (
          <div key={event.id} className="flex items-center gap-2 text-sm">
            <Icon className={`size-3.5 shrink-0 ${EVENT_COLORS[event.event_type as keyof typeof EVENT_COLORS]}`} />
            <span className="font-medium">{event.athlete_name}</span>
            {event.assist_athlete_name && (
              <span className="text-muted-foreground">(assist. {event.assist_athlete_name})</span>
            )}
            <span className="ml-auto text-xs text-muted-foreground">{teamName}</span>
          </div>
        )
      })}
    </div>
  )
}
