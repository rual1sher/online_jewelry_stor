import { ArrowLeft, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useOrder } from '@/api/orders'
import { Loading } from '@/components/common/loading'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { OrderFinancials } from './components/order-financials'
import { OrderFormDialog } from './components/order-form-dialog'
import { OrderItemsList } from './components/order-items-list'
import { OrderStatusActions } from './components/order-status-actions'
import { OrderStatusHistory } from './components/order-status-history'
import { PaymentsSection } from './components/payments-section'

const EDITABLE_STATUSES = ['NEW', 'CONFIRMED']

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading } = useOrder(id)
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading || !order) return <Loading />

  const canEdit = EDITABLE_STATUSES.includes(order.status)

  return (
    <div>
      <title>{`Заказ ${order.orderNumber} — Ювелир`}</title>
      <Link to="/orders" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Назад к заказам
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-[26px] font-semibold text-ink">Заказ {order.orderNumber}</h1>
            <StatusBadge label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONE[order.status]} />
            <StatusBadge
              label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
              tone={PAYMENT_STATUS_TONE[order.paymentStatus]}
            />
          </div>
          <p className="mt-1 text-[13px] text-muted">Создан {formatDateTime(order.createdAt)}</p>
          {order.comment ? <p className="mt-2 text-sm text-ink">{order.comment}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" /> Редактировать
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
