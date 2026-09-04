import { useDashboard } from '@/api/dashboard'
import { DateRangeFilter } from '@/components/common/date-range-filter'
import { Loading } from '@/components/common/loading'
import { MetricCard } from '@/components/common/metric-card'
import { PageHeader } from '@/components/common/page-header'
import { formatMoney } from '@/lib/format'
import { useDashboardDateFilter, useDashboardIsoRange } from '@/store/dateFilter'
import { RevenueProfitChart } from '@/components/common/revenue-profit-chart'
import { LowStockTable } from './components/low-stock-table'
import { RecentOrdersTable } from './components/recent-orders-table'

export function DashboardPage() {
  const { preset, customFrom, customTo, setPreset, setCustomRange } = useDashboardDateFilter()
  const { from, to } = useDashboardIsoRange()
  const { data, isLoading } = useDashboard(from, to)

  return (
    <div>
      <title>Дашборд — Ювелир</title>
      <PageHeader
        title="Панель управления"
        actions={
          <DateRangeFilter
            preset={preset}
            customFrom={customFrom}
            customTo={customTo}
            onPresetChange={setPreset}
            onCustomRangeChange={setCustomRange}
          />
        }
      />

      {isLoading || !data ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard label="Выручка" value={formatMoney(data.revenue)} active />
            <MetricCard label="Чистая прибыль" value={formatMoney(data.netProfit)} />
            <MetricCard label="Количество заказов" value={data.ordersCount} />
            <MetricCard label="Стоимость склада" value={formatMoney(data.stockValue)} />
          </div>

          <RevenueProfitChart data={data.chartData} />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <RecentOrdersTable orders={data.recentOrders} />
            <LowStockTable items={data.lowStockItems} />
          </div>
        </div>
      )}
    </div>
  )
}
