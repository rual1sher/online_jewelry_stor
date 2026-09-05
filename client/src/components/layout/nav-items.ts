import {
  Gem,
  LayoutDashboard,
  LineChart,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Wallet,
} from 'lucide-react'
import type { UserRole } from '@/api/types'
import type { TKey } from '@/lib/i18n'

export interface NavItem {
  to: string
  labelKey: TKey
  icon: typeof LayoutDashboard
  roles: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, roles: ['OWNER'] },
  { to: '/products', labelKey: 'nav.products', icon: Gem, roles: ['OWNER', 'MANAGER'] },
  { to: '/orders', labelKey: 'nav.orders', icon: ShoppingCart, roles: ['OWNER', 'MANAGER'] },
  { to: '/inventory', labelKey: 'nav.inventory', icon: Package, roles: ['OWNER', 'MANAGER'] },
  { to: '/expenses', labelKey: 'nav.expenses', icon: Receipt, roles: ['OWNER'] },
  { to: '/finance', labelKey: 'nav.finance', icon: Wallet, roles: ['OWNER'] },
  { to: '/reports', labelKey: 'nav.reports', icon: LineChart, roles: ['OWNER'] },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings, roles: ['OWNER'] },
]
