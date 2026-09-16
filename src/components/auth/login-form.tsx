import { useState } from 'react'
import { useNavigate, Link  } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { signInWithEfootballId } from '#/lib/auth/api'
import { loginSchema  } from '#/lib/auth/schemas'
import type {LoginFormValues} from '#/lib/auth/schemas';
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Alert, AlertDescription } from '#/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'

export function LoginForm() {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { efootballId: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null)
    const { error } = await signInWithEfootballId(values.efootballId, values.password)
    if (error) {
      setAuthError('ID do eFootball ou senha incorretos.')
      return
    }
    navigate({ to: '/perfil' })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        {authError && (
          <Alert variant="destructive">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="efootballId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do eFootball</FormLabel>
              <FormControl>
                <Input placeholder="seu_id_no_jogo" autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-2" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{' '}
          <Link to="/cadastrar" className="font-medium text-primary underline-offset-4 hover:underline">
            Criar conta
          </Link>
        </p>
      </form>
    </Form>
  )
}
