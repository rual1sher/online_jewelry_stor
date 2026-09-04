import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/api/client'
import { useCreateOrder, useUpdateOrder } from '@/api/orders'
import type { OrderDetail } from '@/api/types'
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
import { DELIVERY_PAYER_LABELS } from '@/lib/constants'
import { emptyOrderItem, orderFormSchema, type OrderFormOutput, type OrderFormValues } from './order-form-schema'
import { OrderItemsEditor } from './order-items-editor'

export function OrderFormDialog({
  order,
  open,
  onOpenChange,
}: {
  order?: OrderDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createOrder = useCreateOrder()
  const updateOrder = useUpdateOrder()
  const isEdit = Boolean(order)

  const form = useForm<OrderFormValues, unknown, OrderFormOutput>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { items: [emptyOrderItem], deliveryPrice: 0, deliveryPaidBy: 'CUSTOMER' },
  })

  useEffect(() => {
    if (!open) return
    if (order) {
      form.reset({
        items: order.items.map((item) => ({
          productId: item.variant.product.id,
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtSale: item.priceAtSale,
        })),
        deliveryPrice: order.deliveryPrice,
        deliveryPaidBy: order.deliveryPaidBy,
        comment: order.comment ?? '',
      })
    } else {
      form.reset({ items: [emptyOrderItem], deliveryPrice: 0, deliveryPaidBy: 'CUSTOMER' })
    }
  }, [open, order, form])

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      items: values.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtSale: item.priceAtSale,
      })),
      deliveryPrice: values.deliveryPrice,
      deliveryPaidBy: values.deliveryPaidBy,
      comment: values.comment,
    }
    try {
      if (order) {
        await updateOrder.mutateAsync({ id: order.id, ...payload })
        toast.success('Заказ обновлён')
      } else {
        await createOrder.mutateAsync(payload)
        toast.success('Заказ создан')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось сохранить заказ'))
    }
  })

  const pending = createOrder.isPending || updateOrder.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Заказ ${order?.orderNumber}` : 'Новый заказ'}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <section>
              <h3 className="mb-3 text-[15px] font-semibold text-ink">Товары</h3>
              <OrderItemsEditor />
              {form.formState.errors.items?.message ? (
                <p className="mt-1 text-[12px] text-danger">{form.formState.errors.items.message}</p>
              ) : null}
            </section>

            <section className="rounded-md border border-line p-4">
              <h3 className="mb-3 text-[15px] font-semibold text-ink">Доставка</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="deliveryPrice">Цена доставки</Label>
                  <MoneyInput
                    id="deliveryPrice"
                    value={form.watch('deliveryPrice')}
                    onChange={(v) => form.setValue('deliveryPrice', v)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Кто оплачивает</Label>
                  <Select
                    value={form.watch('deliveryPaidBy')}
                    onValueChange={(v) => form.setValue('deliveryPaidBy', v as 'CUSTOMER' | 'STORE')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DELIVERY_PAYER_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                <Label htmlFor="order-comment">Комментарий</Label>
                <Textarea id="order-comment" rows={2} {...form.register('comment')} />
              </div>
            </section>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Сохраняем…' : isEdit ? 'Сохранить изменения' : 'Создать заказ'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
