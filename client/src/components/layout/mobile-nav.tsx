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
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] text-muted',
              isActive && 'text-accent',
            )
          }
        >
          <item.icon className="size-5" strokeWidth={1.5} />
          {t(item.labelKey)}
        </NavLink>
      ))}
    </nav>
  )
}
