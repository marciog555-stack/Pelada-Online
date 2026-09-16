import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import {
  checkEfootballIdAvailable,
  checkPhoneAvailable,
  signUpWithEfootballId,
} from '#/lib/auth/api'
import { EFOOTBALL_ID_PATTERN, PHONE_DIGITS_PATTERN, normalizePhone } from '#/lib/auth/efootball'
import { signupSchema, PLATFORM_OPTIONS  } from '#/lib/auth/schemas'
import type {SignupFormValues} from '#/lib/auth/schemas';
import { useDebouncedValue } from '#/hooks/use-debounced-value'
import { PENDING_ID_CLAIM_KEY } from '#/lib/auth/pending-claim'
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

export function SignupForm() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [claimNotice, setClaimNotice] = useState<string | null>(null)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      efootballId: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      nickname: '',
      platform: 'pc',
      phone: '',
      state: '',
      city: '',
    },
  })

  const efootballIdValue = form.watch('efootballId')
  const phoneValue = form.watch('phone')
  const debouncedId = useDebouncedValue(efootballIdValue, 500)
  const debouncedPhone = useDebouncedValue(phoneValue, 500)

  const idAvailability = useQuery({
    queryKey: ['efootball-id-available', debouncedId.toLowerCase()],
    enabled: EFOOTBALL_ID_PATTERN.test(debouncedId),
    queryFn: () => checkEfootballIdAvailable(debouncedId),
  })

  const normalizedPhone = normalizePhone(debouncedPhone)
  const phoneAvailability = useQuery({
    queryKey: ['phone-available', normalizedPhone],
    enabled: PHONE_DIGITS_PATTERN.test(normalizedPhone),
    queryFn: () => checkPhoneAvailable(normalizedPhone),
  })

  function handleClaimId() {
    localStorage.setItem(PENDING_ID_CLAIM_KEY, debouncedId)
    setClaimNotice(
      `Beleza. Termine seu cadastro com outro ID e, no seu perfil, abra "Esse ID é meu" para @${debouncedId}.`,
    )
  }

  async function onSubmit(values: SignupFormValues) {
    setFormError(null)

    const idOk = await checkEfootballIdAvailable(values.efootballId)
    if (!idOk) {
      form.setError('efootballId', { message: 'Esse ID já está em uso.' })
      return
    }

    const phoneOk = await checkPhoneAvailable(values.phone)
    if (!phoneOk) {
      form.setError('phone', { message: 'Esse celular já está cadastrado em outra conta.' })
      return
    }

    const { data, error } = await signUpWithEfootballId(values)
    if (error) {
      setFormError(error.message)
      return
    }

    if (!data.session) {
      setFormError('Conta criada, mas não foi possível entrar automaticamente. Tente entrar com seu ID e senha.')
      navigate({ to: '/entrar' })
      return
    }

    // A conta acabou de logar: RedirectIfAuthed (em /cadastrar) já vai mandar
    // para /perfil assim que o status de auth virar "signed-in", então não
    // navegamos aqui para não competir com esse redirect. Quem decide se
    // vai direto para a contestação de ID (localStorage) é a própria /perfil.
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
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
              <IdAvailabilityHint
                value={debouncedId}
                query={idAvailability}
                onClaim={handleClaimId}
              />
              {claimNotice && <p className="text-sm text-accent">{claimNotice}</p>}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome in-game</FormLabel>
              <FormControl>
                <Input placeholder="Como aparece no jogo" {...field} />
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
              <FormLabel>Apelido (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Como a galera te chama" {...field} />
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

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Celular (WhatsApp)</FormLabel>
              <FormControl>
                <Input placeholder="DDD + número" inputMode="numeric" autoComplete="tel" {...field} />
              </FormControl>
              <PhoneAvailabilityHint value={normalizedPhone} query={phoneAvailability} />
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
                <FormLabel>Estado (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="SP" {...field} />
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
                <FormLabel>Cidade (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Sua cidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="mt-2" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
    </Form>
  )
}

function IdAvailabilityHint({
  value,
  query,
  onClaim,
}: {
  value: string
  query: { isFetching: boolean; data: boolean | undefined }
  onClaim: () => void
}) {
  if (!EFOOTBALL_ID_PATTERN.test(value)) return null
  if (query.isFetching) {
    return (
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> checando…
      </p>
    )
  }
  if (query.data === true) {
    return (
      <p className="flex items-center gap-1 text-sm text-primary">
        <CheckCircle2 className="size-3.5" /> disponível
      </p>
    )
  }
  if (query.data === false) {
    return (
      <div className="flex items-center gap-2">
        <p className="flex items-center gap-1 text-sm text-destructive">
          <XCircle className="size-3.5" /> esse ID já está em uso
        </p>
        <button
          type="button"
          onClick={onClaim}
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Esse ID é meu
        </button>
      </div>
    )
  }
  return null
}

function PhoneAvailabilityHint({
  value,
  query,
}: {
  value: string
  query: { isFetching: boolean; data: boolean | undefined }
}) {
  if (!PHONE_DIGITS_PATTERN.test(value)) return null
  if (query.isFetching) {
    return (
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> checando…
      </p>
    )
  }
  if (query.data === false) {
    return (
      <p className="flex items-center gap-1 text-sm text-destructive">
        <XCircle className="size-3.5" /> celular já cadastrado em outra conta
      </p>
    )
  }
  return null
}
