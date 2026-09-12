import { useFinanceSummary } from '@/api/finance'
import {
  useExpenseDynamics,
  useProfitDynamics,
  useRevenueDynamics,
  useTopProfitable,
  useTopSelling,
} from '@/api/reports'
import { DateRangeFilter } from '@/components/common/date-range-filter'
import { Loading } from '@/components/common/loading'
import { MetricCard } from '@/components/common/metric-card'
import { MoneyText } from '@/components/common/money-text'
import { PageHeader } from '@/components/common/page-header'
import { RevenueProfitChart } from '@/components/common/revenue-profit-chart'
import { useLocalDateRange } from '@/lib/dateRange'
import { useT } from '@/lib/i18n'
import { ExpenseDynamicsChart } from './components/expense-dynamics-chart'
import { TopProductsTable } from './components/top-products-table'

export function FinancePage() {
  const t = useT()
  const { preset, customFrom, customTo, setPreset, setCustomRange, iso } = useLocalDateRange()

  const { data: summary, isLoading: summaryLoading } = useFinanceSummary(iso.from, iso.to)
  const { data: revenue } = useRevenueDynamics(iso.from, iso.to)
  const { data: profit } = useProfitDynamics(iso.from, iso.to)
  const { data: expenses } = useExpenseDynamics(iso.from, iso.to)
  const { data: topSelling, isLoading: topSellingLoading } = useTopSelling(iso.from, iso.to)
  const { data: topProfitable, isLoading: topProfitableLoading } = useTopProfitable(iso.from, iso.to)

  const revenueByDate = new Map((revenue ?? []).map((r) => [r.date, r.revenue]))
  const profitByDate = new Map((profit ?? []).map((p) => [p.date, p.profit]))
  const dates = Array.from(new Set([...revenueByDate.keys(), ...profitByDate.keys()])).sort()
  const chartData = dates.map((date) => ({
    date,
    revenue: revenueByDate.get(date) ?? 0,
    profit: profitByDate.get(date) ?? 0,
  }))

  return (
    <div>
      <title>{`${t('finance.title')} — ${t('common.appName')}`}</title>
      <PageHeader
        title={t('finance.title')}
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

      <div className="flex flex-col gap-6">
        {summaryLoading || !summary ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <MetricCard label={t('finance.revenue')} value={<MoneyText amount={summary.revenue} />} active />
            <MetricCard label={t('finance.cogs')} value={<MoneyText amount={summary.cogs} />} />
            <MetricCard label={t('finance.grossProfit')} value={<MoneyText amount={summary.grossProfit} />} />
            <MetricCard label={t('finance.totalExpenses')} value={<MoneyText amount={summary.totalExpenses} />} />
            <MetricCard
              label={t('finance.storeDelivery')}
              value={<MoneyText amount={summary.storeDeliveryCost} />}
            />
            <MetricCard
              label={t('finance.netProfit')}
              value={<MoneyText amount={summary.netProfit} tone="success" />}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5">
          <RevenueProfitChart data={chartData} />
          <ExpenseDynamicsChart data={expenses ?? []} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <TopProductsTable
            title={t('reports.topSelling')}
            data={topSelling}
            isLoading={topSellingLoading}
          />
          <TopProductsTable
            title={t('reports.topProfitable')}
            data={topProfitable}
            isLoading={topProfitableLoading}
            showCostAndProfit
          />
        </div>
      </div>
    </div>
  )
}
