import { useDashboard } from '@/api/dashboard'
import { DateRangeFilter } from '@/components/common/date-range-filter'
import { Loading } from '@/components/common/loading'
import { MetricCard } from '@/components/common/metric-card'
import { PageHeader } from '@/components/common/page-header'
import { formatMoney } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { useDashboardDateFilter, useDashboardIsoRange } from '@/store/dateFilter'
import { RevenueProfitChart } from '@/components/common/revenue-profit-chart'
import { LowStockTable } from './components/low-stock-table'
import { RecentOrdersTable } from './components/recent-orders-table'

export function DashboardPage() {
  const t = useT()
  const { preset, customFrom, customTo, setPreset, setCustomRange } = useDashboardDateFilter()
  const { from, to } = useDashboardIsoRange()
  const { data, isLoading } = useDashboard(from, to)

  return (
    <div>
      <title>{`${t('nav.dashboard')} — ${t('common.appName')}`}</title>
      <PageHeader
        title={t('dashboard.title')}
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
            <MetricCard label={t('dashboard.revenue')} value={formatMoney(data.revenue)} active />
            <MetricCard label={t('dashboard.netProfit')} value={formatMoney(data.netProfit)} />
            <MetricCard label={t('dashboard.ordersCount')} value={data.ordersCount} />
            <MetricCard label={t('dashboard.stockValue')} value={formatMoney(data.stockValue)} />
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
