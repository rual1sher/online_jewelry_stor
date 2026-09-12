import { LogOut, Moon, Settings, Sun } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { LangSwitcher } from '@/components/common/lang-switcher'
import { useT } from '@/lib/i18n'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { MobileNav } from './mobile-nav'
import { Sidebar } from './sidebar'

/** На мобильных боковой панели нет, поэтому язык, тема и выход живут в верхней полосе. */
function MobileTopBar() {
  const t = useT()
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="flex h-12 items-center justify-between border-b border-line bg-surface px-4 md:hidden">
      <span className="font-display text-[16px] font-semibold text-ink">{t('common.appName')}</span>
      <div className="flex items-center gap-1">
        <LangSwitcher />
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-md p-1.5 text-muted transition-colors hover:text-ink"
          aria-label={t('common.toggleTheme')}
        >
          {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </button>
        {user?.role === 'OWNER' ? (
          <Link
            to="/settings"
            className="rounded-md p-1.5 text-muted transition-colors hover:text-ink"
            aria-label={t('settings.title')}
          >
            <Settings className="size-[18px]" strokeWidth={1.5} />
          </Link>
        ) : null}
        <button
          type="button"
          onClick={clearSession}
          className="rounded-md p-1.5 text-muted transition-colors hover:text-ink"
          aria-label={t('common.logout')}
        >
          <LogOut className="size-[18px]" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-16 md:pb-0">
        <MobileTopBar />
        <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
