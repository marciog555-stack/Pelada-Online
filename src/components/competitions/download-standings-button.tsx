import { Printer } from 'lucide-react'
import { Button } from '#/components/ui/button'

// Sem backend/lib de PDF: usa o "Salvar como PDF" nativo do navegador via
// window.print(), com CSS de impressão (print:hidden) escondendo nav,
// abas e botões - sobra só a tabela mesmo, que é uma folha A4 razoável.
export function DownloadStandingsButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="size-4" />
      Baixar tabela em PDF
    </Button>
  )
}
