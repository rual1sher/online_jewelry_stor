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
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'

const schema = z.object({
  amount: z.number().int().min(1, 'Сумма должна быть больше 0'),
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
        toast.success('Оплата добавлена')
      } else {
        await refundPayment.mutateAsync({ id: orderId, ...values })
        toast.success('Возврат оформлен')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось сохранить операцию'))
    }
  })

  const pending = addPayment.isPending || refundPayment.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px]">
        <DialogHeader>
          <DialogTitle>{mode === 'payment' ? 'Добавить оплату' : 'Оформить возврат'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-amount">Сумма</Label>
            <MoneyInput id="payment-amount" value={watch('amount')} onChange={(v) => setValue('amount', v)} />
            {errors.amount ? <p className="text-[12px] text-danger">{errors.amount.message}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Способ оплаты</Label>
            <Select value={watch('method')} onValueChange={(v) => setValue('method', v as FormValues['method'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-comment">Комментарий</Label>
            <Textarea id="payment-comment" rows={2} {...register('comment')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Сохраняем…' : mode === 'payment' ? 'Добавить' : 'Оформить возврат'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
