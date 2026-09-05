import { ArrowLeft, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useOrder } from '@/api/orders'
import { Loading } from '@/components/common/loading'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import {
  ORDER_STATUS_KEY,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_KEY,
  PAYMENT_STATUS_TONE,
} from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { OrderFinancials } from './components/order-financials'
import { OrderFormDialog } from './components/order-form-dialog'
import { OrderItemsList } from './components/order-items-list'
import { OrderStatusActions } from './components/order-status-actions'
import { OrderStatusHistory } from './components/order-status-history'
import { PaymentsSection } from './components/payments-section'

const EDITABLE_STATUSES = ['NEW', 'CONFIRMED']

export function OrderDetailPage() {
  const t = useT()
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading } = useOrder(id)
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading || !order) return <Loading />

  const canEdit = EDITABLE_STATUSES.includes(order.status)

  return (
    <div>
      <title>{`${t('orders.one', { number: order.orderNumber })} — ${t('common.appName')}`}</title>
      <Link to="/orders" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> {t('orders.backToList')}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-[26px] font-semibold text-ink">
              {t('orders.one', { number: order.orderNumber })}
            </h1>
            <StatusBadge label={t(ORDER_STATUS_KEY[order.status])} tone={ORDER_STATUS_TONE[order.status]} />
            <StatusBadge
              label={t(PAYMENT_STATUS_KEY[order.paymentStatus])}
              tone={PAYMENT_STATUS_TONE[order.paymentStatus]}
            />
          </div>
          <p className="mt-1 text-[13px] text-muted">
            {t('orders.createdAt', { date: formatDateTime(order.createdAt) })}
          </p>
          {order.comment ? <p className="mt-2 text-sm text-ink">{order.comment}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" /> {t('common.edit')}
            </Button>
          ) : null}
          <OrderStatusActions order={order} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="flex flex-col gap-5 xl:col-span-2">
          <OrderItemsList items={order.items} />
          <PaymentsSection order={order} />
        </div>
        <div className="flex flex-col gap-5">
          <OrderFinancials order={order} />
          <OrderStatusHistory history={order.statusHistory} />
        </div>
      </div>

      <OrderFormDialog order={order} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
