import { Package, Plus } from 'lucide-react'
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
  ORDER_STATUS_KEY,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_KEY,
  PAYMENT_STATUS_TONE,
} from '@/lib/constants'
import { formatDateTime, formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { OrderFormDialog } from './components/order-form-dialog'
import { OrdersFilters } from './components/orders-filters'

const LIMIT = 20

export function OrdersPage() {
  const t = useT()
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
      <title>{`${t('orders.title')} — ${t('common.appName')}`}</title>
      <PageHeader
        title={t('orders.title')}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> {t('orders.new')}
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
          <EmptyState message={t('dashboard.ordersEmpty')} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('orders.number')}</TableHead>
                  <TableHead>{t('field.products')}</TableHead>
                  <TableHead>{t('orders.itemsAmount')}</TableHead>
                  <TableHead>{t('field.packaging')}</TableHead>
                  <TableHead>{t('field.delivery')}</TableHead>
                  <TableHead>{t('orders.totalAmount')}</TableHead>
                  <TableHead>{t('field.payment')}</TableHead>
                  <TableHead>{t('field.status')}</TableHead>
                  <TableHead>{t('field.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <TableCell className="font-medium text-accent whitespace-nowrap">{order.orderNumber}</TableCell>
                    <TableCell className="min-w-[180px]">
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 shrink-0 overflow-hidden rounded-md border border-line bg-canvas flex items-center justify-center">
                          {order.productImage ? (
                            <img src={order.productImage} alt="" className="size-full object-cover" />
                          ) : (
                            <Package className="size-4 text-muted/60" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-ink truncate text-[13px]">
                              {order.productName || t('field.products')}
                            </span>
                            {order.itemsCount > 1 ? (
                              <span className="shrink-0 rounded bg-canvas px-1 py-0.5 text-[10px] font-semibold text-muted border border-line">
                                +{order.itemsCount - 1}
                              </span>
                            ) : null}
                          </div>
                          {order.variantName ? (
                            <span className="text-[12px] text-muted truncate">
                              {order.variantName}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <MoneyText amount={order.itemsAmount} className="text-[13px]" />
                    </TableCell>
                    <TableCell className="tabular-nums text-muted text-[13px]">
                      {order.packagingPrice > 0 ? (
                        <span title={order.packaging?.name ?? undefined}>
                          +{formatNumber(order.packagingPrice)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted">
                      {order.deliveryPrice > 0 ? `+${formatNumber(order.deliveryPrice)}` : '—'}
                    </TableCell>
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
            <Pagination page={page} limit={LIMIT} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <OrderFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
