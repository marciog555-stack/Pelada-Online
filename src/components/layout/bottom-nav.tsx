import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Trophy, Plus, Medal, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '#/lib/utils'

const LEFT_ITEMS = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/ligas', label: 'Ligas', icon: Trophy },
] as const

const RIGHT_ITEMS = [
  { to: '/temporadas', label: 'Ranking', icon: Medal },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
] as const

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-md items-center">
        {LEFT_ITEMS.map((item) => (
          <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} pathname={pathname} />
        ))}

        <Link to="/ligas/nova" className="flex flex-1 flex-col items-center justify-center" aria-label="Criar liga">
          <span className="-mt-7 flex size-13 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Plus className="size-6" />
          </span>
        </Link>

        {RIGHT_ITEMS.map((item) => (
          <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} pathname={pathname} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({
  to,
  label,
  icon: Icon,
  pathname,
}: {
  to: string
  label: string
  icon: LucideIcon
  pathname: string
}) {
  const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
  return (
    <Link
      to={to}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs',
        active ? 'text-primary' : 'text-muted-foreground',
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  )
}
