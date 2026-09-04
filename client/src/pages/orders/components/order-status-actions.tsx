import { useState } from 'react'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/api/client'
import { useUpdateOrderStatus } from '@/api/orders'
import type { OrderDetail, OrderStatus } from '@/api/types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { Button } from '@/components/ui/button'
import { ORDER_STATUS_LABELS } from '@/lib/constants'

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export function OrderStatusActions({ order }: { order: OrderDetail }) {
  const updateStatus = useUpdateOrderStatus()
  const [confirmTarget, setConfirmTarget] = useState<OrderStatus | null>(null)

  const nextStatuses = ALLOWED_TRANSITIONS[order.status]
  if (nextStatuses.length === 0) return null

  const handleConfirm = async () => {
    if (!confirmTarget) return
    try {
      await updateStatus.mutateAsync({ id: order.id, status: confirmTarget })
      toast.success(`Статус изменён на «${ORDER_STATUS_LABELS[confirmTarget]}»`)
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {nextStatuses.map((status) => (
        <Button
          key={status}
          variant={status === 'CANCELLED' ? 'danger' : 'primary'}
          size="sm"
          onClick={() => setConfirmTarget(status)}
        >
          {status === 'CANCELLED' ? 'Отменить заказ' : `→ ${ORDER_STATUS_LABELS[status]}`}
        </Button>
      ))}
      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={confirmTarget ? `Перевести заказ в статус «${ORDER_STATUS_LABELS[confirmTarget]}»?` : ''}
        description={
          confirmTarget === 'SHIPPED'
            ? 'Товар будет списан со склада.'
            : confirmTarget === 'CANCELLED' && order.status === 'SHIPPED'
              ? 'Товар будет возвращён на склад, заказ исключается из выручки.'
              : undefined
        }
        danger={confirmTarget === 'CANCELLED'}
        confirmLabel="Подтвердить"
        onConfirm={handleConfirm}
      />
    </div>
  )
}
