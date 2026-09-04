import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '@/api/orders'
import type { OrderStatus, PaymentStatus } from '@/api/types'
import { EmptyState } from '@/components/common/empty-state'
import { Loading } from '@/components/common/loading'
import { MoneyText } from '@/components/common/money-text'
import { PageHeader } from '@/components/common/page-header'
import { Pagination } from '@/components/common/pagination'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
} from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { OrderFormDialog } from './components/order-form-dialog'
import { OrdersFilters } from './components/orders-filters'

const LIMIT = 20

export function OrdersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | undefined>()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>()
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading } = useOrders({
    page,
    limit: LIMIT,
    search: search || undefined,
    status,
    paymentStatus,
  })

  return (
    <div>
      <title>Заказы — Ювелир</title>
      <PageHeader
        title="Заказы"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Новый заказ
          </Button>
        }
      />

      <div className="mb-4">
        <OrdersFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          status={status}
          onStatusChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
          paymentStatus={paymentStatus}
          onPaymentStatusChange={(v) => {
            setPaymentStatus(v)
            setPage(1)
          }}
        />
      </div>

      <Card className="overflow-hidden">
        {isLoading || !data ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <EmptyState message="Заказов пока нет — они появятся здесь после первой продажи" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№ заказа</TableHead>
                  <TableHead>Товары</TableHead>
                  <TableHead>Сумма товаров</TableHead>
                  <TableHead>Доставка</TableHead>
                  <TableHead>Общая сумма</TableHead>
                  <TableHead>Оплата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <TableCell className="font-medium text-accent">{order.orderNumber}</TableCell>
                    <TableCell>{order.itemsCount}</TableCell>
                    <TableCell>
                      <MoneyText amount={order.itemsAmount} className="text-[13px]" />
                    </TableCell>
                    <TableCell className="tabular-nums text-muted">
                      {order.deliveryPrice > 0 ? `+${order.deliveryPrice.toLocaleString('ru-RU')}` : '—'}
                    </TableCell>
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
            <Pagination page={page} limit={LIMIT} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <OrderFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
