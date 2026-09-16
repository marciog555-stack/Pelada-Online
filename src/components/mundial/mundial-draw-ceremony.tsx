import { useEffect, useState } from 'react'
import { Trophy, Sparkles } from 'lucide-react'
import { generateFirstRoundPairings } from '#/lib/competition-engine'
import { computeMundialDraw, commitMundialDraw } from '#/lib/mundial/api'
import { Button } from '#/components/ui/button'
import { Alert, AlertDescription } from '#/components/ui/alert'

type CeremonySlot = { id: string; team_name: string; crest_url: string | null }

const REVEAL_INTERVAL_MS = 900
const START_DELAY_MS = 900
const PAIRINGS_DELAY_MS = 700

type Phase = 'preparing' | 'revealing' | 'pairings' | 'committing'

export function MundialDrawCeremony({
  mundialId,
  slots,
  onCommitted,
  onCancel,
}: {
  mundialId: string
  slots: CeremonySlot[]
  onCommitted: () => void
  onCancel: () => void
}) {
  const [seedOrder, setSeedOrder] = useState<string[]>(() => computeMundialDraw(slots.map((s) => s.id)))
  const [phase, setPhase] = useState<Phase>('preparing')
  const [revealedCount, setRevealedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const slotById = new Map(slots.map((s) => [s.id, s]))

  useEffect(() => {
    if (phase === 'preparing') {
      const t = setTimeout(() => setPhase('revealing'), START_DELAY_MS)
      return () => clearTimeout(t)
    }

    if (phase === 'revealing') {
      if (revealedCount >= seedOrder.length) {
        const t = setTimeout(() => setPhase('pairings'), PAIRINGS_DELAY_MS)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setRevealedCount((c) => c + 1), REVEAL_INTERVAL_MS)
      return () => clearTimeout(t)
    }
  }, [phase, revealedCount, seedOrder.length])

  function handleReshuffle() {
    setSeedOrder(computeMundialDraw(slots.map((s) => s.id)))
    setRevealedCount(0)
    setPhase('preparing')
  }

  async function handleConfirm() {
    setPhase('committing')
    setError(null)
    try {
      await commitMundialDraw(mundialId, seedOrder)
      onCommitted()
    } catch {
      setError('Não foi possível salvar o sorteio. Tente de novo.')
      setPhase('pairings')
    }
  }

  const pairings = phase === 'pairings' || phase === 'committing' ? generateFirstRoundPairings(seedOrder) : []

  return (
    <div className="grid gap-5">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid justify-items-center gap-1 text-center">
        <Sparkles className="size-6 text-primary" />
        <p className="font-display text-xl">Sorteio ao vivo</p>
        <p className="text-sm text-muted-foreground">
          {phase === 'preparing' && 'Preparando o pote…'}
          {phase === 'revealing' && `Sorteando… ${revealedCount}/${seedOrder.length}`}
          {(phase === 'pairings' || phase === 'committing') && 'Confrontos formados!'}
        </p>
      </div>

      {phase !== 'pairings' && phase !== 'committing' && (
        <div className="grid gap-2">
          {seedOrder.map((slotId, index) => {
            const slot = slotById.get(slotId)!
            const revealed = index < revealedCount
            return (
              <div
                key={slotId}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                  revealed ? 'border-primary/40 bg-primary/10' : 'border-border bg-card'
                }`}
              >
                <span className="w-6 shrink-0 text-center text-sm text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                {revealed ? (
                  <div key={`${slotId}-revealed`} className="flex flex-1 items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                    {slot.crest_url ? (
                      <img src={slot.crest_url} alt="" className="size-7 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="size-7 shrink-0 rounded-full bg-secondary" />
                    )}
                    <p className="truncate text-sm font-medium">{slot.team_name}</p>
                  </div>
                ) : (
                  <p className="flex-1 text-sm text-muted-foreground">Sorteando…</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {(phase === 'pairings' || phase === 'committing') && (
        <div className="grid gap-2">
          {pairings.map((pairing, index) => {
            const home = pairing.participantA ? slotById.get(pairing.participantA) : null
            const away = pairing.participantB ? slotById.get(pairing.participantB) : null
            const isBye = !home || !away
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'backwards' }}
              >
                <PairingSide slot={home} />
                {!isBye && <span className="text-xs text-muted-foreground">x</span>}
                <PairingSide slot={away} align="right" />
              </div>
            )
          })}
        </div>
      )}

      {phase === 'pairings' && (
        <div className="grid gap-2">
          <Button onClick={handleConfirm}>
            <Trophy className="size-4" /> Confirmar e começar o Mundial
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleReshuffle}>
              Sortear de novo
            </Button>
            <Button variant="ghost" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {phase === 'committing' && (
        <Button disabled className="justify-self-stretch">
          Salvando…
        </Button>
      )}
    </div>
  )
}

function PairingSide({ slot, align = 'left' }: { slot: CeremonySlot | null | undefined; align?: 'left' | 'right' }) {
  if (!slot) {
    return <p className="flex-1 text-sm text-muted-foreground">Folga</p>
  }
  return (
    <div className={`flex flex-1 items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      {slot.crest_url ? (
        <img src={slot.crest_url} alt="" className="size-6 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="size-6 shrink-0 rounded-full bg-secondary" />
      )}
      <p className="truncate text-sm">{slot.team_name}</p>
    </div>
  )
}
