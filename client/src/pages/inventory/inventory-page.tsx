import { useStockTable } from '@/api/inventory'
import { MetricCard } from '@/components/common/metric-card'
import { PageHeader } from '@/components/common/page-header'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatMoney } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { MovementsTable } from './components/movements-table'
import { StockTable } from './components/stock-table'

export function InventoryPage() {
  const t = useT()
  const { data } = useStockTable(false)

  return (
    <div>
      <title>{`${t('inventory.title')} — ${t('common.appName')}`}</title>
      <PageHeader title={t('inventory.title')} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label={t('inventory.totalVariants')} value={data?.summary.totalVariants ?? 0} active />
        <MetricCard label={t('inventory.totalUnits')} value={data?.summary.totalUnits ?? 0} />
        <MetricCard
          label={t('inventory.stockValue')}
          value={formatMoney(data?.summary.totalStockValue ?? 0)}
        />
        <MetricCard label={t('inventory.lowStock')} value={data?.summary.lowStockCount ?? 0} />
      </div>

      <Card className="p-5">
        <Tabs defaultValue="stock">
          <TabsList>
            <TabsTrigger value="stock">{t('inventory.tabStock')}</TabsTrigger>
            <TabsTrigger value="movements">{t('inventory.tabMovements')}</TabsTrigger>
          </TabsList>
          <TabsContent value="stock">
            <StockTable />
          </TabsContent>
          <TabsContent value="movements">
            <MovementsTable />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
