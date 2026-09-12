import type { TopProduct } from '@/api/types'
import { EmptyState } from '@/components/common/empty-state'
import { Loading } from '@/components/common/loading'
import { MoneyText } from '@/components/common/money-text'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useT } from '@/lib/i18n'

interface TopProductsTableProps {
  title: string
  data: TopProduct[] | undefined
  isLoading: boolean
  showCostAndProfit?: boolean
}

export function TopProductsTable({ title, data, isLoading, showCostAndProfit }: TopProductsTableProps) {
  const t = useT()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <Loading />
        ) : !data || data.length === 0 ? (
          <EmptyState message={t('reports.noSales')} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('field.product')}</TableHead>
                <TableHead>{t('reports.soldQty')}</TableHead>
                <TableHead>{t('chart.revenue')}</TableHead>
                {showCostAndProfit ? (
                  <>
                    <TableHead>{t('field.cost')}</TableHead>
                    <TableHead>{t('chart.profit')}</TableHead>
                  </>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.variantId}>
                  <TableCell className="font-medium">
                    {item.productName}
                    <div className="text-[12px] text-muted">{item.variantName}</div>
                  </TableCell>
                  <TableCell className="tabular-nums">{item.quantitySold}</TableCell>
                  <TableCell>
                    <MoneyText amount={item.revenue} className="text-[13px]" />
                  </TableCell>
                  {showCostAndProfit ? (
                    <>
                      <TableCell>
                        <MoneyText amount={item.cogs} className="text-[13px]" />
                      </TableCell>
                      <TableCell>
                        <MoneyText amount={item.profit} tone="success" className="text-[13px]" />
                      </TableCell>
                    </>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
