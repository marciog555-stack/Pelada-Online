import type { ReactNode } from 'react'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <p className="font-display text-4xl tracking-wide text-primary">PELADA ONLINE</p>
        <h1 className="mt-4 text-xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">{children}</div>
    </div>
  )
}
