import type { OrderDetail } from '@/api/types'
import { MoneyText } from '@/components/common/money-text'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DELIVERY_PAYER_LABELS } from '@/lib/constants'

function Row({ label, amount, tone }: { label: string; amount: number; tone?: 'default' | 'success' | 'danger' }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-muted">{label}</span>
      <MoneyText amount={amount} tone={tone} className="text-[13px]" />
    </div>
  )
}

export function OrderFinancials({ order }: { order: OrderDetail }) {
  const f = order.financials
  return (
    <Card>
      <CardHeader>
        <CardTitle>Финансовый результат</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-line">
        <Row label="Выручка" amount={f.revenue} />
        <Row label="Себестоимость проданного" amount={f.cogs} />
        <Row label="Валовая прибыль" amount={f.grossProfit} />
        <Row
          label={`Доставка (${DELIVERY_PAYER_LABELS[order.deliveryPaidBy]})`}
          amount={order.deliveryPrice}
        />
        {f.storeDeliveryCost > 0 ? (
          <Row label="Расход на доставку (магазин)" amount={f.storeDeliveryCost} tone="danger" />
        ) : null}
        <Row label="Чистая прибыль" amount={f.netProfit} tone="success" />
      </CardContent>
    </Card>
  )
}
