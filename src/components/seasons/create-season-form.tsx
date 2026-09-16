import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createSeason } from '#/lib/seasons/api'
import { createSeasonSchema } from '#/lib/seasons/schemas'
import type { CreateSeasonFormValues } from '#/lib/seasons/schemas'
import { useAuth } from '#/lib/auth/auth-provider'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '#/components/ui/form'

export function CreateSeasonForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateSeasonFormValues>({
    resolver: zodResolver(createSeasonSchema),
    defaultValues: { name: '', startsAt: '', endsAt: '' },
  })

  async function onSubmit(values: CreateSeasonFormValues) {
    setError(null)
    if (!user) return
    try {
      const season = await createSeason({ ...values, createdBy: user.id })
      navigate({ to: '/temporadas/$seasonId', params: { seasonId: season.id } })
    } catch {
      setError('Não foi possível criar a temporada. Tente de novo.')
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
              <FormLabel>Nome da temporada</FormLabel>
              <FormControl>
                <Input placeholder="Temporada 2025/1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="startsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Término</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Criando…' : 'Criar temporada'}
        </Button>
      </form>
    </Form>
  )
}
