import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { submitMatchReport  } from '#/lib/competitions/api'
import type {MatchEventInput} from '#/lib/competitions/api';
import { uploadMatchProof } from '#/lib/storage'
import { matchReportSchema, EVENT_TYPE_OPTIONS  } from '#/lib/competitions/schemas'
import type {MatchReportFormValues} from '#/lib/competitions/schemas';
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '#/components/ui/form'

type Side = { id: string; team_name: string }

export function MatchReportForm({
  matchId,
  home,
  away,
  onSubmitted,
}: {
  matchId: string
  home: Side
  away: Side
  onSubmitted: () => void
}) {
  const [events, setEvents] = useState<MatchEventInput[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<MatchReportFormValues>({
    resolver: zodResolver(matchReportSchema),
    defaultValues: {
      homeGoals: 0,
      awayGoals: 0,
      homeRedCards: 0,
      awayRedCards: 0,
      homeYellowCards: 0,
      awayYellowCards: 0,
      message: '',
    },
  })

  function addEvent() {
    setEvents((prev) => [...prev, { participantId: home.id, eventType: 'goal', athleteName: '' }])
  }

  function updateEvent(index: number, patch: Partial<MatchEventInput>) {
    setEvents((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)))
  }

  function removeEvent(index: number) {
    setEvents((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(values: MatchReportFormValues) {
    setError(null)
    if (!file) {
      setError('Anexe o print da tela final do jogo.')
      return
    }
    const invalidEvent = events.find((e) => !e.athleteName.trim())
    if (invalidEvent) {
      setError('Preencha o nome do atleta em todo evento adicionado (ou remova a linha).')
      return
    }

    setSubmitting(true)
    try {
      const screenshotPath = await uploadMatchProof(matchId, file)
      await submitMatchReport({
        matchId,
        homeGoals: values.homeGoals,
        awayGoals: values.awayGoals,
        homeRedCards: values.homeRedCards,
        awayRedCards: values.awayRedCards,
        homeYellowCards: values.homeYellowCards,
        awayYellowCards: values.awayYellowCards,
        screenshotPath,
        events,
      })
      onSubmitted()
    } catch {
      setError('Não foi possível enviar o resultado. Tente de novo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-3">
          <ScoreField control={form.control} name="homeGoals" label={home.team_name} />
          <ScoreField control={form.control} name="awayGoals" label={away.team_name} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ScoreField control={form.control} name="homeYellowCards" label={`Amarelos - ${home.team_name}`} />
          <ScoreField control={form.control} name="awayYellowCards" label={`Amarelos - ${away.team_name}`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ScoreField control={form.control} name="homeRedCards" label={`Vermelhos - ${home.team_name}`} />
          <ScoreField control={form.control} name="awayRedCards" label={`Vermelhos - ${away.team_name}`} />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>Gols e cartões por atleta</Label>
            <Button type="button" size="sm" variant="secondary" onClick={addEvent}>
              <Plus className="size-4" /> Adicionar
            </Button>
          </div>
          {events.map((event, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 rounded-lg border border-border p-2">
              <Select
                value={event.participantId}
                onValueChange={(value) => updateEvent(index, { participantId: value })}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={home.id}>{home.team_name}</SelectItem>
                  <SelectItem value={away.id}>{away.team_name}</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" size="icon" variant="ghost" onClick={() => removeEvent(index)}>
                <Trash2 className="size-4" />
              </Button>

              <Select
                value={event.eventType}
                onValueChange={(value) => updateEvent(index, { eventType: value as MatchEventInput['eventType'] })}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span />

              <Input
                placeholder="Nome do atleta"
                value={event.athleteName}
                onChange={(e) => updateEvent(index, { athleteName: e.target.value })}
                className="col-span-3"
              />
              {event.eventType === 'goal' && (
                <Input
                  placeholder="Assistência (opcional)"
                  value={event.assistAthleteName ?? ''}
                  onChange={(e) => updateEvent(index, { assistAthleteName: e.target.value })}
                  className="col-span-3"
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="match-proof">Print da tela final</Label>
          <Input
            id="match-proof"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Algo pra combinar com o adversário/admin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar resultado'}
        </Button>
      </form>
    </Form>
  )
}

function ScoreField({
  control,
  name,
  label,
}: {
  control: Control<MatchReportFormValues>
  name: 'homeGoals' | 'awayGoals' | 'homeRedCards' | 'awayRedCards' | 'homeYellowCards' | 'awayYellowCards'
  label: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="truncate text-xs">{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              name={field.name}
              ref={field.ref}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
