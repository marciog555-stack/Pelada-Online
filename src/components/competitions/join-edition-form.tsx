import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { joinEditionSchema  } from '#/lib/competitions/schemas'
import type {JoinEditionFormValues} from '#/lib/competitions/schemas';
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '#/components/ui/form'

export function JoinEditionForm({
  onSubmit,
}: {
  onSubmit: (values: JoinEditionFormValues) => Promise<void>
}) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm<JoinEditionFormValues>({
    resolver: zodResolver(joinEditionSchema),
    defaultValues: { teamName: '', primaryColor: '#33e58c' },
  })

  async function handleSubmit(values: JoinEditionFormValues) {
    setError(null)
    try {
      await onSubmit(values)
    } catch {
      setError('Não foi possível entrar no campeonato. Tente de novo.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Entrar nesse campeonato</p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="teamName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do seu time</FormLabel>
              <FormControl>
                <Input placeholder="Furacão FC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor principal</FormLabel>
              <FormControl>
                <input
                  type="color"
                  className="h-10 w-16 rounded-md border border-input bg-transparent"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </Form>
  )
}
