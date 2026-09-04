import { useFinanceSummary } from '@/api/finance'
import { DateRangeFilter } from '@/components/common/date-range-filter'
import { Loading } from '@/components/common/loading'
import { MetricCard } from '@/components/common/metric-card'
import { MoneyText } from '@/components/common/money-text'
import { PageHeader } from '@/components/common/page-header'
import { useLocalDateRange } from '@/lib/dateRange'

export function FinancePage() {
  const { preset, customFrom, customTo, setPreset, setCustomRange, iso } = useLocalDateRange()
  const { data, isLoading } = useFinanceSummary(iso.from, iso.to)

  return (
    <div>
      <title>Финансы — Ювелир</title>
      <PageHeader
        title="Финансы"
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
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <MetricCard label="Выручка" value={<MoneyText amount={data.revenue} />} active />
            <MetricCard label="Себестоимость проданного" value={<MoneyText amount={data.cogs} />} />
            <MetricCard label="Валовая прибыль" value={<MoneyText amount={data.grossProfit} />} />
            <MetricCard label="Общие расходы" value={<MoneyText amount={data.totalExpenses} />} />
            <MetricCard
              label="Доставка (магазин)"
              value={<MoneyText amount={data.storeDeliveryCost} />}
            />
            <MetricCard
              label="Чистая прибыль"
              value={<MoneyText amount={data.netProfit} tone="success" />}
            />
          </div>
        </div>
      )}
    </div>
  )
}
