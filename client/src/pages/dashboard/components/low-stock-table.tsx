import { EmptyState } from '@/components/common/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { LowStockItem } from '@/api/types'

export function LowStockTable({ items }: { items: LowStockItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Товары с низким остатком</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <EmptyState message="Все товары в достаточном количестве" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Товар</TableHead>
                <TableHead>Вариант</TableHead>
                <TableHead>Остаток</TableHead>
                <TableHead>Мин.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.variantId}>
                  <TableCell>
                    <div className="size-10 overflow-hidden rounded bg-canvas">
                      {item.image ? (
                        <img src={item.image} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="text-muted">{item.variantName}</TableCell>
                  <TableCell className="tabular-nums font-semibold text-danger">
                    {item.currentStock}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted">{item.minStock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
