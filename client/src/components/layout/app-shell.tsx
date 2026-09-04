import { Outlet } from 'react-router-dom'
import { MobileNav } from './mobile-nav'
import { Sidebar } from './sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-16 md:pb-0">
        <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
