import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function AppHeader({ title, backTo }: { title: string; backTo?: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur print:hidden">
      {backTo && (
        <Link to={backTo} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
      )}
      <h1 className="font-display text-lg tracking-wide">{title}</h1>
    </header>
  )
}
