import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/common/empty-state'
import { MoneyText } from '@/components/common/money-text'
import { StatusBadge } from '@/components/common/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { DashboardOverview } from '@/api/types'
import {
  ORDER_STATUS_KEY,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_KEY,
  PAYMENT_STATUS_TONE,
} from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { useT } from '@/lib/i18n'

export function RecentOrdersTable({ orders }: { orders: DashboardOverview['recentOrders'] }) {
  const t = useT()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.recentOrders')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <EmptyState message={t('dashboard.ordersEmpty')} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.number')}</TableHead>
                <TableHead>{t('field.products')}</TableHead>
                <TableHead>{t('field.amount')}</TableHead>
                <TableHead>{t('field.payment')}</TableHead>
                <TableHead>{t('field.status')}</TableHead>
                <TableHead>{t('field.date')}</TableHead>
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
                      label={t(PAYMENT_STATUS_KEY[order.paymentStatus])}
                      tone={PAYMENT_STATUS_TONE[order.paymentStatus]}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={t(ORDER_STATUS_KEY[order.status])}
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
