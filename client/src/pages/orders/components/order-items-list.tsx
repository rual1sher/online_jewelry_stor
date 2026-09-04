import type { OrderItem } from '@/api/types'
import { MoneyText } from '@/components/common/money-text'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Товары</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Товар</TableHead>
            <TableHead>Вариант</TableHead>
            <TableHead>Кол-во</TableHead>
            <TableHead>Цена за шт.</TableHead>
            <TableHead>Сумма</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.variant.product.name}</TableCell>
              <TableCell className="text-muted">{item.variant.name}</TableCell>
              <TableCell className="tabular-nums">{item.quantity}</TableCell>
              <TableCell>
                <MoneyText amount={item.priceAtSale} className="text-[13px]" />
              </TableCell>
              <TableCell>
                <MoneyText amount={item.priceAtSale * item.quantity} className="text-[13px]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
