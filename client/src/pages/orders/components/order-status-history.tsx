import type { OrderStatusHistoryEntry } from '@/api/types'
import { StatusBadge } from '@/components/common/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'

export function OrderStatusHistory({ history }: { history: OrderStatusHistoryEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>История статусов</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {history.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between text-[13px]">
            <StatusBadge label={ORDER_STATUS_LABELS[entry.status]} tone={ORDER_STATUS_TONE[entry.status]} />
            <span className="text-muted">{formatDateTime(entry.changedAt)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
