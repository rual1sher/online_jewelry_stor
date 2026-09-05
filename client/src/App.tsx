import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AppShell } from '@/components/layout/app-shell'
import { Loading } from '@/components/common/loading'
import { Toaster } from '@/components/ui/sonner'
import { LoginPage } from '@/pages/auth'
import { useLang } from '@/lib/i18n'

const DashboardPage = lazy(() => import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })))
const ProductsPage = lazy(() => import('@/pages/products').then((m) => ({ default: m.ProductsPage })))
const ProductDetailPage = lazy(() =>
  import('@/pages/products').then((m) => ({ default: m.ProductDetailPage })),
)
const OrdersPage = lazy(() => import('@/pages/orders').then((m) => ({ default: m.OrdersPage })))
const OrderDetailPage = lazy(() => import('@/pages/orders').then((m) => ({ default: m.OrderDetailPage })))
const InventoryPage = lazy(() => import('@/pages/inventory').then((m) => ({ default: m.InventoryPage })))
const ExpensesPage = lazy(() => import('@/pages/expenses').then((m) => ({ default: m.ExpensesPage })))
const FinancePage = lazy(() => import('@/pages/finance').then((m) => ({ default: m.FinancePage })))
const ReportsPage = lazy(() => import('@/pages/reports').then((m) => ({ default: m.ReportsPage })))
const SettingsPage = lazy(() => import('@/pages/settings').then((m) => ({ default: m.SettingsPage })))

function App() {
  // Смена языка перемонтирует дерево страниц — так подхватываются и форматтеры дат/сумм,
  // которые читают язык вне React.
  const lang = useLang()

  return (
    <BrowserRouter>
      <Toaster />
      <Suspense fallback={<Loading className="min-h-screen" />}>
        <Routes key={lang}>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <ProtectedRoute roles={['OWNER']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route
              path="expenses"
              element={
                <ProtectedRoute roles={['OWNER']}>
                  <ExpensesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="finance"
              element={
                <ProtectedRoute roles={['OWNER']}>
                  <FinancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute roles={['OWNER']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute roles={['OWNER']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
