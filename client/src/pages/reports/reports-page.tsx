import { RevenueProfitChart } from '@/components/common/revenue-profit-chart'
import { DateRangeFilter } from '@/components/common/date-range-filter'
import { PageHeader } from '@/components/common/page-header'
import { useLocalDateRange } from '@/lib/dateRange'
import {
  useExpenseDynamics,
  useProfitDynamics,
  useRevenueDynamics,
  useTopProfitable,
  useTopSelling,
} from '@/api/reports'
import { ExpenseDynamicsChart } from './components/expense-dynamics-chart'
import { TopProductsTable } from './components/top-products-table'

export function ReportsPage() {
  const { preset, customFrom, customTo, setPreset, setCustomRange, iso } = useLocalDateRange()

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
      <title>Отчёты — Ювелир</title>
      <PageHeader
        title="Отчёты"
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

      <div className="flex flex-col gap-5">
        <RevenueProfitChart data={chartData} />
        <ExpenseDynamicsChart data={expenses ?? []} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <TopProductsTable title="Самые продаваемые товары" data={topSelling} isLoading={topSellingLoading} />
          <TopProductsTable
            title="Самые прибыльные товары"
            data={topProfitable}
            isLoading={topProfitableLoading}
            showCostAndProfit
          />
        </div>
      </div>
    </div>
  )
}
