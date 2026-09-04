import { LogOut, Moon, Sun } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)
  const { theme, toggleTheme } = useThemeStore()

  const items = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role))

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-line px-4">
        <span className="font-display text-[18px] font-semibold text-ink">Ювелир</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-muted transition-colors hover:text-ink',
                isActive && 'border-accent font-semibold text-ink',
              )
            }
          >
            <item.icon className="size-[18px] shrink-0" strokeWidth={1.5} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-ink">{user?.name}</div>
            <div className="text-[12px] text-muted">
              {user?.role === 'OWNER' ? 'Владелец' : 'Менеджер'}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink"
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>
        </div>
        <button
          type="button"
          onClick={clearSession}
          className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[13px] text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <LogOut className="size-4" strokeWidth={1.5} />
          Выйти
        </button>
      </div>
    </aside>
  )
}
