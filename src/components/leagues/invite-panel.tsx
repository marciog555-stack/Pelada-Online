import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Copy, RefreshCw } from 'lucide-react'
import { regenerateInviteCode, updateLeagueSettings } from '#/lib/leagues/api'
import { Button } from '#/components/ui/button'
import { Switch } from '#/components/ui/switch'
import type { League } from '#/hooks/use-leagues'

export function InvitePanel({
  league,
  isAdmin,
  onChanged,
}: {
  league: League
  isAdmin: boolean
  onChanged: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const inviteUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/convite/${league.invite_code}` : ''

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    setBusy(true)
    try {
      await regenerateInviteCode(league.id)
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleApproval(checked: boolean) {
    setBusy(true)
    try {
      await updateLeagueSettings(league.id, { requireApproval: checked })
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex justify-center rounded-lg bg-white p-4">
        <QRCodeSVG value={inviteUrl} size={180} />
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2">
        <p className="flex-1 truncate text-sm text-muted-foreground">{inviteUrl}</p>
        <Button type="button" size="icon" variant="ghost" onClick={handleCopy}>
          {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
        </Button>
      </div>

      {isAdmin && (
        <>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Aprovar entrada manualmente</p>
              <p className="text-xs text-muted-foreground">Quem entrar pelo link fica pendente até aprovar.</p>
            </div>
            <Switch checked={league.require_approval} onCheckedChange={handleToggleApproval} disabled={busy} />
          </div>

          <Button type="button" variant="outline" onClick={handleRegenerate} disabled={busy}>
            <RefreshCw className="size-4" /> Gerar novo link
          </Button>
        </>
      )}
    </div>
  )
}
