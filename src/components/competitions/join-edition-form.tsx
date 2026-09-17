import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { joinEditionSchema  } from '#/lib/competitions/schemas'
import type {JoinEditionFormValues} from '#/lib/competitions/schemas';
import type { CatalogClub } from '#/lib/competitions/team-catalog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '#/components/ui/form'

export function JoinEditionForm({
  onSubmit,
  catalog,
  takenTeamNames,
}: {
  onSubmit: (values: JoinEditionFormValues) => Promise<void>
  catalog?: CatalogClub[]
  takenTeamNames: string[]
}) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm<JoinEditionFormValues>({
    resolver: zodResolver(joinEditionSchema),
    defaultValues: { teamName: '', primaryColor: '#22c55e' },
  })

  async function handleSubmit(values: JoinEditionFormValues) {
    setError(null)
    try {
      await onSubmit(values)
    } catch {
      setError('Não foi possível entrar no campeonato. Tente de novo.')
    }
  }

  const availableClubs = catalog?.filter((club) => !takenTeamNames.includes(club.name))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Entrar nesse campeonato</p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {availableClubs ? (
          <FormField
            control={form.control}
            name="teamName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escolha seu time</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    const club = availableClubs.find((c) => c.name === value)
                    if (club) form.setValue('primaryColor', club.color)
                  }}
                  value={field.value}
                  disabled={availableClubs.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          availableClubs.length === 0 ? 'Nenhum time livre nessa liga' : 'Selecione um time'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableClubs.map((club) => (
                      <SelectItem key={club.name} value={club.name}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableClubs.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Todos os times dessa liga já foram escolhidos nessa edição.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
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
        )}

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

        <Button
          type="submit"
          disabled={form.formState.isSubmitting || (!!availableClubs && availableClubs.length === 0)}
        >
          {form.formState.isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </Form>
  )
}
