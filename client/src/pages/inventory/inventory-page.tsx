import { useStockTable } from '@/api/inventory'
import { MetricCard } from '@/components/common/metric-card'
import { PageHeader } from '@/components/common/page-header'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatMoney } from '@/lib/format'
import { MovementsTable } from './components/movements-table'
import { StockTable } from './components/stock-table'

export function InventoryPage() {
  const { data } = useStockTable(false)

  return (
    <div>
      <title>Склад — Ювелир</title>
      <PageHeader title="Склад" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Видов товаров" value={data?.summary.totalVariants ?? 0} active />
        <MetricCard label="Всего единиц" value={data?.summary.totalUnits ?? 0} />
        <MetricCard label="Стоимость склада" value={formatMoney(data?.summary.totalStockValue ?? 0)} />
        <MetricCard label="Мало осталось" value={data?.summary.lowStockCount ?? 0} />
      </div>

      <Card className="p-5">
        <Tabs defaultValue="stock">
          <TabsList>
            <TabsTrigger value="stock">Остатки</TabsTrigger>
            <TabsTrigger value="movements">История движений</TabsTrigger>
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
