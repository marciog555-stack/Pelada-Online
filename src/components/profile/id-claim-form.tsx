import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { supabase } from '#/lib/supabase/client'
import { uploadIdClaimProof } from '#/lib/storage'
import { idClaimSchema  } from '#/lib/auth/schemas'
import type {IdClaimFormValues} from '#/lib/auth/schemas';
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '#/components/ui/form'

export function IdClaimForm({
  claimantId,
  targetProfileId,
  efootballId,
  onSubmitted,
}: {
  claimantId: string
  targetProfileId: string
  efootballId: string
  onSubmitted: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<IdClaimFormValues>({
    resolver: zodResolver(idClaimSchema),
    defaultValues: { message: '' },
  })

  async function onSubmit(values: IdClaimFormValues) {
    setError(null)
    if (!file) {
      setError('Anexe um print do seu perfil no eFootball mostrando o ID.')
      return
    }

    setSubmitting(true)
    try {
      const proofPath = await uploadIdClaimProof(claimantId, file)
      const { error: insertError } = await supabase.from('efootball_id_claims').insert({
        claimant_id: claimantId,
        target_profile_id: targetProfileId,
        efootball_id: efootballId,
        proof_image_path: proofPath,
        admin_note: values.message || null,
      })
      if (insertError) throw insertError
      onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a contestação.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-2">
          <Label htmlFor="claim-proof">Print do seu perfil no eFootball</Label>
          <Input
            id="claim-proof"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">PNG, JPG ou WebP até 2 MB</p>
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem para o admin (opcional)</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Conte o que aconteceu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar contestação'}
        </Button>
      </form>
    </Form>
  )
}
