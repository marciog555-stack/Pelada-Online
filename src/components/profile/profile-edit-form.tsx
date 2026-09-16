import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { supabase } from '#/lib/supabase/client'
import { profileEditSchema, PLATFORM_OPTIONS  } from '#/lib/auth/schemas'
import type {ProfileEditFormValues} from '#/lib/auth/schemas';
import type { Profile } from '#/hooks/use-profile'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'

export function ProfileEditForm({
  profile,
  onSaved,
}: {
  profile: Profile
  onSaved: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      displayName: profile.display_name,
      nickname: profile.nickname ?? '',
      platform: profile.platform as ProfileEditFormValues['platform'],
      state: profile.state ?? '',
      city: profile.city ?? '',
    },
  })

  async function onSubmit(values: ProfileEditFormValues) {
    setError(null)
    setSaved(false)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: values.displayName,
        nickname: values.nickname || null,
        platform: values.platform,
        state: values.state || null,
        city: values.city || null,
      })
      .eq('id', profile.id)

    if (updateError) {
      setError('Não foi possível salvar. Tente de novo.')
      return
    }
    setSaved(true)
    onSaved()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {saved && (
          <Alert>
            <AlertDescription>Perfil atualizado.</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome in-game</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apelido</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plataforma</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((option) => (
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

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </form>
    </Form>
  )
}
