import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createMundial } from '#/lib/mundial/api'
import { createMundialSchema } from '#/lib/mundial/schemas'
import type { CreateMundialFormValues } from '#/lib/mundial/schemas'
import { useAuth } from '#/lib/auth/auth-provider'
import { useSeasons } from '#/hooks/use-seasons'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '#/components/ui/form'

export function CreateMundialForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: seasons } = useSeasons()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateMundialFormValues>({
    resolver: zodResolver(createMundialSchema),
    defaultValues: { seasonId: '', name: '', maxSlots: '' },
  })

  async function onSubmit(values: CreateMundialFormValues) {
    setError(null)
    if (!user) return
    try {
      const maxSlots = values.maxSlots?.trim() ? Number(values.maxSlots) : null
      const mundial = await createMundial({
        seasonId: values.seasonId,
        name: values.name,
        maxSlots,
        createdBy: user.id,
      })
      navigate({ to: '/mundial/$mundialId', params: { mundialId: mundial.id } })
    } catch {
      setError('Não foi possível criar o Mundial. Tente de novo.')
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
          name="seasonId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temporada</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a temporada" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {seasons?.map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Os campeões elegíveis são os das edições encerradas dentro do período dessa temporada.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Mundial</FormLabel>
              <FormControl>
                <Input placeholder="Mundial Pelada Online 2025" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxSlots"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de vagas (opcional)</FormLabel>
              <FormControl>
                <Input type="number" min={2} inputMode="numeric" placeholder="Sem limite" {...field} />
              </FormControl>
              <FormDescription>Deixe em branco pra aceitar todos os campeões elegíveis.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Criando…' : 'Criar Mundial'}
        </Button>
      </form>
    </Form>
  )
}
