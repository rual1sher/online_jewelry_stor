import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/common/empty-state'
import { MoneyText } from '@/components/common/money-text'
import { StatusBadge } from '@/components/common/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { DashboardOverview } from '@/api/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'

export function RecentOrdersTable({ orders }: { orders: DashboardOverview['recentOrders'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние заказы</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <EmptyState message="Заказов пока нет — они появятся здесь после первой продажи" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>№ заказа</TableHead>
                <TableHead>Товары</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Оплата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link to={`/orders/${order.id}`} className="font-medium text-accent hover:underline">
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{order.itemsCount}</TableCell>
                  <TableCell>
                    <MoneyText amount={order.totalAmount} className="text-[13px]" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
                      tone={PAYMENT_STATUS_TONE[order.paymentStatus]}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={ORDER_STATUS_LABELS[order.status]}
                      tone={ORDER_STATUS_TONE[order.status]}
                    />
                  </TableCell>
                  <TableCell className="text-muted">{formatDateTime(order.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
