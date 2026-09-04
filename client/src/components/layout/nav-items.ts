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

export interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard, roles: ['OWNER'] },
  { to: '/products', label: 'Товары', icon: Gem, roles: ['OWNER', 'MANAGER'] },
  { to: '/orders', label: 'Заказы', icon: ShoppingCart, roles: ['OWNER', 'MANAGER'] },
  { to: '/inventory', label: 'Склад', icon: Package, roles: ['OWNER', 'MANAGER'] },
  { to: '/expenses', label: 'Расходы', icon: Receipt, roles: ['OWNER'] },
  { to: '/finance', label: 'Финансы', icon: Wallet, roles: ['OWNER'] },
  { to: '/reports', label: 'Отчёты', icon: LineChart, roles: ['OWNER'] },
  { to: '/settings', label: 'Настройки', icon: Settings, roles: ['OWNER'] },
]
