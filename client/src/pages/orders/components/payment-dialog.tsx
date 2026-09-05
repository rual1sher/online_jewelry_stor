import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { apiErrorMessage } from '@/api/client'
import { useAddPayment, useRefundPayment } from '@/api/orders'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { MoneyInput } from '@/components/ui/money-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PAYMENT_METHODS, PAYMENT_METHOD_KEY } from '@/lib/constants'
import { useT, type TKey } from '@/lib/i18n'

const schema = z.object({
  amount: z.number().int().min(1, 'validation.amountPositive'),
  method: z.enum(['CASH', 'CARD', 'CLICK', 'PAYME', 'BANK_TRANSFER', 'OTHER']),
  comment: z.string().optional(),
})

type FormValues = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function PaymentDialog({
  orderId,
  mode,
  open,
  onOpenChange,
}: {
  orderId: string
  mode: 'payment' | 'refund'
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useT()
  const addPayment = useAddPayment()
  const refundPayment = useRefundPayment()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { method: 'CASH', amount: 0 },
  })

  useEffect(() => {
    if (open) reset({ method: 'CASH', amount: 0, comment: '' })
  }, [open, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (mode === 'payment') {
        await addPayment.mutateAsync({ id: orderId, ...values })
        toast.success(t('orders.paymentAdded'))
      } else {
        await refundPayment.mutateAsync({ id: orderId, ...values })
        toast.success(t('orders.refundDone'))
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, t('orders.paymentFailed')))
    }
  })

  const pending = addPayment.isPending || refundPayment.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px]">
        <DialogHeader>
          <DialogTitle>{mode === 'payment' ? t('orders.addPayment') : t('orders.refundTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-amount">{t('field.amount')}</Label>
            <MoneyInput id="payment-amount" value={watch('amount')} onChange={(v) => setValue('amount', v)} />
            {errors.amount ? (
              <p className="text-[12px] text-danger">{t(errors.amount.message as TKey)}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t('orders.paymentMethod')}</Label>
            <Select value={watch('method')} onValueChange={(v) => setValue('method', v as FormValues['method'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {t(PAYMENT_METHOD_KEY[method])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-comment">{t('field.comment')}</Label>
            <Textarea id="payment-comment" rows={2} {...register('comment')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? t('common.saving')
                : mode === 'payment'
                  ? t('common.add')
                  : t('orders.refundTitle')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
