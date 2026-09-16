import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createCompetition } from '#/lib/competitions/api'
import { createCompetitionSchema, PRESET_OPTIONS  } from '#/lib/competitions/schemas'
import type {CreateCompetitionFormValues} from '#/lib/competitions/schemas';
import { useAuth } from '#/lib/auth/auth-provider'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '#/components/ui/form'

export function CreateCompetitionForm({ leagueId }: { leagueId: string }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateCompetitionFormValues>({
    resolver: zodResolver(createCompetitionSchema),
    defaultValues: { name: '', presetId: 'brasileirao-serie-a' },
  })

  async function onSubmit(values: CreateCompetitionFormValues) {
    setError(null)
    if (!user) return
    try {
      const competition = await createCompetition({
        leagueId,
        name: values.name,
        presetId: values.presetId,
        createdBy: user.id,
      })
      navigate({ to: '/campeonatos/$competitionId', params: { competitionId: competition.id } })
    } catch {
      setError('Não foi possível criar o campeonato. Tente de novo.')
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do campeonato</FormLabel>
              <FormControl>
                <Input placeholder="Brasileirão da Resenha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="presetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Formato</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRESET_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Criando…' : 'Criar campeonato'}
        </Button>
      </form>
    </Form>
  )
}
