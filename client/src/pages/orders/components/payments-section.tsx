import { useState } from 'react'
import type { OrderDetail } from '@/api/types'
import { EmptyState } from '@/components/common/empty-state'
import { MoneyText } from '@/components/common/money-text'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { PaymentDialog } from './payment-dialog'

export function PaymentsSection({ order }: { order: OrderDetail }) {
  const [dialogMode, setDialogMode] = useState<'payment' | 'refund' | null>(null)
  const paidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>История оплат</CardTitle>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDialogMode('refund')} disabled={paidAmount <= 0}>
            Возврат
          </Button>
          <Button size="sm" onClick={() => setDialogMode('payment')}>
            Добавить оплату
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {order.payments.length === 0 ? (
          <EmptyState message="Оплат по заказу пока нет" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Способ</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Комментарий</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted">{formatDateTime(payment.paidAt)}</TableCell>
                  <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
                  <TableCell>
                    <MoneyText
                      amount={payment.amount}
                      tone={payment.amount < 0 ? 'danger' : 'default'}
                      className="text-[13px]"
                    />
                  </TableCell>
                  <TableCell className="text-muted">{payment.comment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-[13px]">
          <span className="text-muted">Оплачено / Осталось</span>
          <span>
            <MoneyText amount={order.financials.paidAmount} className="text-[13px]" /> /{' '}
            <MoneyText amount={order.financials.remainingAmount} className="text-[13px]" tone="danger" />
          </span>
        </div>
      </CardContent>
      {dialogMode ? (
        <PaymentDialog
          orderId={order.id}
          mode={dialogMode}
          open={Boolean(dialogMode)}
          onOpenChange={(open) => !open && setDialogMode(null)}
        />
      ) : null}
    </Card>
  )
}
