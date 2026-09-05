import { useState } from 'react'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/api/client'
import { useUpdateOrderStatus } from '@/api/orders'
import type { OrderDetail, OrderStatus } from '@/api/types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { Button } from '@/components/ui/button'
import { ORDER_STATUS_KEY } from '@/lib/constants'
import { useT } from '@/lib/i18n'

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export function OrderStatusActions({ order }: { order: OrderDetail }) {
  const t = useT()
  const updateStatus = useUpdateOrderStatus()
  const [confirmTarget, setConfirmTarget] = useState<OrderStatus | null>(null)

  const nextStatuses = ALLOWED_TRANSITIONS[order.status]
  if (nextStatuses.length === 0) return null

  const handleConfirm = async () => {
    if (!confirmTarget) return
    try {
      await updateStatus.mutateAsync({ id: order.id, status: confirmTarget })
      toast.success(t('orders.statusChanged', { status: t(ORDER_STATUS_KEY[confirmTarget]) }))
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
          {status === 'CANCELLED' ? t('orders.cancel') : `→ ${t(ORDER_STATUS_KEY[status])}`}
        </Button>
      ))}
      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={
          confirmTarget
            ? t('orders.statusConfirmTitle', { status: t(ORDER_STATUS_KEY[confirmTarget]) })
            : ''
        }
        description={
          confirmTarget === 'SHIPPED'
            ? t('orders.shippedWarning')
            : confirmTarget === 'CANCELLED' && order.status === 'SHIPPED'
              ? t('orders.cancelWarning')
              : undefined
        }
        danger={confirmTarget === 'CANCELLED'}
        confirmLabel={t('common.confirm')}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
