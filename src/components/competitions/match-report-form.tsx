import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { submitMatchReport } from '#/lib/competitions/api'
import type { MatchEventInput } from '#/lib/competitions/api'
import { uploadMatchProof } from '#/lib/storage'
import { matchReportSchema, EVENT_TYPE_OPTIONS } from '#/lib/competitions/schemas'
import type { MatchReportFormValues } from '#/lib/competitions/schemas'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '#/components/ui/form'
import { cn } from '#/lib/utils'

type Side = { id: string; team_name: string }

const STEPS = [
  { title: 'Placar', fields: ['homeGoals', 'awayGoals'] as const },
  { title: 'Cartões', fields: ['homeYellowCards', 'awayYellowCards', 'homeRedCards', 'awayRedCards'] as const },
  { title: 'Eventos', fields: [] as const },
  { title: 'Comprovante', fields: [] as const },
]

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
  const [step, setStep] = useState(0)
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

  async function goNext() {
    setError(null)
    const fields = STEPS[step].fields
    if (fields.length > 0) {
      const valid = await form.trigger(fields)
      if (!valid) return
    }
    if (step === 2) {
      const invalidEvent = events.find((e) => !e.athleteName.trim())
      if (invalidEvent) {
        setError('Preencha o nome do atleta em todo evento adicionado (ou remova a linha).')
        return
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function goBack() {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function onSubmit(values: MatchReportFormValues) {
    setError(null)
    if (!file) {
      setError('Anexe o print da tela final do jogo.')
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

  const isLastStep = step === STEPS.length - 1

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          if (!isLastStep) {
            e.preventDefault()
            return
          }
          form.handleSubmit(onSubmit)(e)
        }}
        className="grid gap-5"
      >
        <StepIndicator step={step} />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 0 && (
          <div className="grid grid-cols-2 gap-3">
            <ScoreField control={form.control} name="homeGoals" label={home.team_name} big />
            <ScoreField control={form.control} name="awayGoals" label={away.team_name} big />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <ScoreField control={form.control} name="homeYellowCards" label={`Amarelos - ${home.team_name}`} />
              <ScoreField control={form.control} name="awayYellowCards" label={`Amarelos - ${away.team_name}`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ScoreField control={form.control} name="homeRedCards" label={`Vermelhos - ${home.team_name}`} />
              <ScoreField control={form.control} name="awayRedCards" label={`Vermelhos - ${away.team_name}`} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Gols e cartões por atleta (opcional)</Label>
              <Button type="button" size="sm" variant="secondary" onClick={addEvent}>
                <Plus className="size-4" /> Adicionar
              </Button>
            </div>
            {events.length === 0 && (
              <p className="rounded-xl border border-dashed border-border bg-card/40 p-4 text-center text-sm text-muted-foreground">
                Nenhum evento adicionado. Pode pular direto pro próximo passo.
              </p>
            )}
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
        )}

        {step === 3 && (
          <div className="grid gap-5">
            <MatchSummary control={form.control} home={home} away={away} eventsCount={events.length} />

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
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" onClick={goBack} disabled={step === 0}>
            <ChevronLeft className="size-4" /> Voltar
          </Button>
          {isLastStep ? (
            <Button key="submit" type="submit" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Enviar resultado'}
            </Button>
          ) : (
            <Button key="continue" type="button" onClick={goNext}>
              Continuar <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Passo {step + 1} de {STEPS.length}
        </span>
        <span className="font-medium text-foreground">{STEPS[step].title}</span>
      </div>
      <div className="flex gap-1.5">
        {STEPS.map((s, index) => (
          <span
            key={s.title}
            className={cn('h-1.5 flex-1 rounded-full transition-colors', index <= step ? 'bg-primary' : 'bg-muted')}
          />
        ))}
      </div>
    </div>
  )
}

function MatchSummary({
  control,
  home,
  away,
  eventsCount,
}: {
  control: Control<MatchReportFormValues>
  home: Side
  away: Side
  eventsCount: number
}) {
  const homeGoals = useWatch({ control, name: 'homeGoals' })
  const awayGoals = useWatch({ control, name: 'awayGoals' })

  return (
    <div className="grid gap-1 rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">Resumo</p>
      <p className="font-display text-2xl tabular-nums">
        {home.team_name} {homeGoals} - {awayGoals} {away.team_name}
      </p>
      {eventsCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {eventsCount} {eventsCount === 1 ? 'evento registrado' : 'eventos registrados'}
        </p>
      )}
    </div>
  )
}

function ScoreField({
  control,
  name,
  label,
  big = false,
}: {
  control: Control<MatchReportFormValues>
  name: 'homeGoals' | 'awayGoals' | 'homeRedCards' | 'awayRedCards' | 'homeYellowCards' | 'awayYellowCards'
  label: string
  big?: boolean
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
              className={big ? 'font-display text-center text-2xl tabular-nums' : undefined}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
