import type { OrderDetail } from '@/api/types'
import { MoneyText } from '@/components/common/money-text'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DELIVERY_PAYER_KEY } from '@/lib/constants'
import { useT } from '@/lib/i18n'

function Row({ label, amount, tone }: { label: string; amount: number; tone?: 'default' | 'success' | 'danger' }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-muted">{label}</span>
      <MoneyText amount={amount} tone={tone} className="text-[13px]" />
    </div>
  )
}

export function OrderFinancials({ order }: { order: OrderDetail }) {
  const t = useT()
  const f = order.financials
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('orders.financials')}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-line">
        <Row label={t('chart.revenue')} amount={f.revenue} />
        <Row label={t('orders.cogs')} amount={f.cogs} />
        <Row label={t('orders.grossProfit')} amount={f.grossProfit} />
        <Row
          label={t('orders.deliveryBy', { payer: t(DELIVERY_PAYER_KEY[order.deliveryPaidBy]) })}
          amount={order.deliveryPrice}
        />
        {f.storeDeliveryCost > 0 ? (
          <Row label={t('orders.storeDeliveryCost')} amount={f.storeDeliveryCost} tone="danger" />
        ) : null}
        <Row label={t('orders.netProfit')} amount={f.netProfit} tone="success" />
      </CardContent>
    </Card>
  )
}
