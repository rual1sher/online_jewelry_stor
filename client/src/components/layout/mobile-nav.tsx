import { NavLink } from 'react-router-dom'
import { useT } from '@/lib/i18n'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'

export function MobileNav() {
  const t = useT()
  const user = useAuthStore((s) => s.user)
  const items = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role)).slice(0, 5)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-line bg-surface md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[11px] text-muted transition-colors',
              isActive && 'text-accent font-medium',
            )
          }
        >
          <item.icon className="size-5 shrink-0" strokeWidth={1.5} />
          <span className="truncate max-w-full px-1 text-center">{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
