import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createLeague } from '#/lib/leagues/api'
import { createLeagueSchema  } from '#/lib/leagues/schemas'
import type {CreateLeagueFormValues} from '#/lib/leagues/schemas';
import { useAuth } from '#/lib/auth/auth-provider'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Switch } from '#/components/ui/switch'
import { Alert, AlertDescription } from '#/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '#/components/ui/form'

export function CreateLeagueForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateLeagueFormValues>({
    resolver: zodResolver(createLeagueSchema),
    defaultValues: { name: '', description: '', requireApproval: false },
  })

  async function onSubmit(values: CreateLeagueFormValues) {
    setError(null)
    if (!user) return
    try {
      const league = await createLeague({
        name: values.name,
        description: values.description,
        requireApproval: values.requireApproval,
        ownerId: user.id,
      })
      navigate({ to: '/ligas/$leagueId', params: { leagueId: league.id } })
    } catch {
      setError('Não foi possível criar a liga. Tente de novo.')
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
              <FormLabel>Nome da liga</FormLabel>
              <FormControl>
                <Input placeholder="Resenha da Firma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Do que se trata essa resenha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requireApproval"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <FormLabel>Aprovar entrada manualmente</FormLabel>
                <FormDescription>Quem entrar pelo link fica pendente até um admin aprovar.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Criando…' : 'Criar liga'}
        </Button>
      </form>
    </Form>
  )
}
