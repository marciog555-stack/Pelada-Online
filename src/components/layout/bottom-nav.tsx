import { Link, useRouterState } from '@tanstack/react-router'
import { Trophy, UserRound } from 'lucide-react'
import { cn } from '#/lib/utils'

const ITEMS = [
  { to: '/ligas', label: 'Ligas', icon: Trophy },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
] as const

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.to)
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
