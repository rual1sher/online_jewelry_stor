import { useFinanceSummary } from '@/api/finance'
import { DateRangeFilter } from '@/components/common/date-range-filter'
import { Loading } from '@/components/common/loading'
import { MetricCard } from '@/components/common/metric-card'
import { MoneyText } from '@/components/common/money-text'
import { PageHeader } from '@/components/common/page-header'
import { useLocalDateRange } from '@/lib/dateRange'
import { useT } from '@/lib/i18n'

export function FinancePage() {
  const t = useT()
  const { preset, customFrom, customTo, setPreset, setCustomRange, iso } = useLocalDateRange()
  const { data, isLoading } = useFinanceSummary(iso.from, iso.to)

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

      {isLoading || !data ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <MetricCard label={t('finance.revenue')} value={<MoneyText amount={data.revenue} />} active />
            <MetricCard label={t('finance.cogs')} value={<MoneyText amount={data.cogs} />} />
            <MetricCard label={t('finance.grossProfit')} value={<MoneyText amount={data.grossProfit} />} />
            <MetricCard label={t('finance.totalExpenses')} value={<MoneyText amount={data.totalExpenses} />} />
            <MetricCard
              label={t('finance.storeDelivery')}
              value={<MoneyText amount={data.storeDeliveryCost} />}
            />
            <MetricCard
              label={t('finance.netProfit')}
              value={<MoneyText amount={data.netProfit} tone="success" />}
            />
          </div>
        </div>
      )}
    </div>
  )
}
