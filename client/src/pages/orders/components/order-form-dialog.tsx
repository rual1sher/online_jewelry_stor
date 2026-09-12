import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/api/client'
import { useCreateOrder, useUpdateOrder } from '@/api/orders'
import { useCreatePackaging, usePackagings } from '@/api/packagings'
import type { OrderDetail } from '@/api/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoneyInput } from '@/components/ui/money-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DELIVERY_PAYERS, DELIVERY_PAYER_KEY } from '@/lib/constants'
import { formatNumber } from '@/lib/format'
import { useT, type TKey } from '@/lib/i18n'
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
  const t = useT()
  const createOrder = useCreateOrder()
  const updateOrder = useUpdateOrder()
  const { data: packagings } = usePackagings()
  const createPackaging = useCreatePackaging()
  const isEdit = Boolean(order)

  const [showNewPackaging, setShowNewPackaging] = useState(false)
  const [newPackagingName, setNewPackagingName] = useState('')
  const [newPackagingPrice, setNewPackagingPrice] = useState(0)

  const form = useForm<OrderFormValues, unknown, OrderFormOutput>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      items: [emptyOrderItem],
      packagingId: null,
      packagingPrice: 0,
      deliveryPrice: 0,
      deliveryPaidBy: 'CUSTOMER',
    },
  })

  useEffect(() => {
    if (!open) return
    setShowNewPackaging(false)
    setNewPackagingName('')
    setNewPackagingPrice(0)

    if (order) {
      form.reset({
        items: order.items.map((item) => ({
          productId: item.variant.product.id,
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtSale: item.priceAtSale,
        })),
        packagingId: order.packagingId ?? null,
        packagingPrice: order.packagingPrice ?? 0,
        deliveryPrice: order.deliveryPrice,
        deliveryPaidBy: order.deliveryPaidBy,
        comment: order.comment ?? '',
      })
    } else {
      form.reset({
        items: [emptyOrderItem],
        packagingId: null,
        packagingPrice: 0,
        deliveryPrice: 0,
        deliveryPaidBy: 'CUSTOMER',
      })
    }
  }, [open, order, form])

  const watchedItems = form.watch('items') || []
  const watchedPackagingPrice = form.watch('packagingPrice') || 0
  const watchedDeliveryPrice = form.watch('deliveryPrice') || 0

  const itemsSum = watchedItems.reduce(
    (acc, i) => acc + (Number(i.quantity) || 0) * (Number(i.priceAtSale) || 0),
    0,
  )
  const totalOrderSum = itemsSum + watchedPackagingPrice + watchedDeliveryPrice

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      items: values.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtSale: item.priceAtSale,
      })),
      packagingId: values.packagingId ? values.packagingId : null,
      packagingPrice: values.packagingPrice,
      deliveryPrice: values.deliveryPrice,
      deliveryPaidBy: values.deliveryPaidBy,
      comment: values.comment,
    }
    try {
      if (order) {
        await updateOrder.mutateAsync({ id: order.id, ...payload })
        toast.success(t('orders.updated'))
      } else {
        await createOrder.mutateAsync(payload)
        toast.success(t('orders.created'))
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, t('orders.saveFailed')))
    }
  })

  const pending = createOrder.isPending || updateOrder.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('orders.one', { number: order?.orderNumber ?? '' }) : t('orders.new')}
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <section>
              <h3 className="mb-3 text-[15px] font-semibold text-ink">{t('field.products')}</h3>
              <OrderItemsEditor />
              {form.formState.errors.items?.message ? (
                <p className="mt-1 text-[12px] text-danger">
                  {t(form.formState.errors.items.message as TKey)}
                </p>
              ) : null}
            </section>

            {/* Qadoq (Karobka) bo'limi */}
            <section className="rounded-md border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ink">{t('orders.packagingSection')}</h3>
                <button
                  type="button"
                  onClick={() => setShowNewPackaging(!showNewPackaging)}
                  className="text-[12px] text-accent hover:underline"
                >
                  {showNewPackaging ? t('common.cancel') : `+ ${t('orders.newPackaging')}`}
                </button>
              </div>

              {showNewPackaging ? (
                <div className="flex flex-wrap items-end gap-2 rounded-md bg-subtle p-3">
                  <div className="flex min-w-[160px] flex-1 flex-col gap-1">
                    <Label className="text-[12px]">{t('settings.newPackagingName')}</Label>
                    <Input
                      placeholder={t('settings.newPackagingName')}
                      value={newPackagingName}
                      onChange={(e) => setNewPackagingName(e.target.value)}
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="flex w-[140px] flex-col gap-1">
                    <Label className="text-[12px]">{t('settings.newPackagingPrice')}</Label>
                    <MoneyInput
                      value={newPackagingPrice}
                      onChange={(v) => setNewPackagingPrice(v)}
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={createPackaging.isPending}
                    onClick={async () => {
                      if (!newPackagingName.trim()) return
                      try {
                        const created = await createPackaging.mutateAsync({
                          name: newPackagingName.trim(),
                          price: newPackagingPrice,
                        })
                        form.setValue('packagingId', created.id)
                        form.setValue('packagingPrice', created.price)
                        setNewPackagingName('')
                        setNewPackagingPrice(0)
                        setShowNewPackaging(false)
                        toast.success(t('common.save'))
                      } catch (e) {
                        toast.error(apiErrorMessage(e))
                      }
                    }}
                  >
                    {t('common.add')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label>{t('orders.selectPackaging')}</Label>
                    <Select
                      value={form.watch('packagingId') || 'none'}
                      onValueChange={(val) => {
                        if (val === 'none') {
                          form.setValue('packagingId', null)
                          form.setValue('packagingPrice', 0)
                        } else {
                          const pkg = packagings?.find((p) => p.id === val)
                          form.setValue('packagingId', val)
                          form.setValue('packagingPrice', pkg?.price ?? 0)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('orders.selectPackaging')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('orders.noPackaging')}</SelectItem>
                        {packagings?.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} ({formatNumber(pkg.price)} soʻm)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="packagingPrice">{t('orders.packagingPrice')}</Label>
                    <MoneyInput
                      id="packagingPrice"
                      value={form.watch('packagingPrice')}
                      onChange={(v) => form.setValue('packagingPrice', v)}
                      disabled={!form.watch('packagingId')}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Yetkazib berish bo'limi */}
            <section className="rounded-md border border-line p-4">
              <h3 className="mb-3 text-[15px] font-semibold text-ink">{t('orders.deliverySection')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="deliveryPrice">{t('orders.deliveryPrice')}</Label>
                  <MoneyInput
                    id="deliveryPrice"
                    value={form.watch('deliveryPrice')}
                    onChange={(v) => form.setValue('deliveryPrice', v)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t('orders.deliveryPaidBy')}</Label>
                  <Select
                    value={form.watch('deliveryPaidBy')}
                    onValueChange={(v) => form.setValue('deliveryPaidBy', v as 'CUSTOMER' | 'STORE')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_PAYERS.map((payer) => (
                        <SelectItem key={payer} value={payer}>
                          {t(DELIVERY_PAYER_KEY[payer])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                <Label htmlFor="order-comment">{t('field.comment')}</Label>
                <Textarea id="order-comment" rows={2} {...form.register('comment')} />
              </div>
            </section>

            {/* Jonli hisob-kitob ko'rinishi */}
            <div className="flex flex-col gap-1.5 rounded-md bg-subtle p-3.5 text-[13px]">
              <div className="flex justify-between text-muted">
                <span>{t('orders.itemsTotal')}</span>
                <span className="font-medium text-ink">{formatNumber(itemsSum)} soʻm</span>
              </div>
              {watchedPackagingPrice > 0 ? (
                <div className="flex justify-between text-muted">
                  <span>{t('field.packaging')}:</span>
                  <span className="font-medium text-ink">+{formatNumber(watchedPackagingPrice)} soʻm</span>
                </div>
              ) : null}
              {watchedDeliveryPrice > 0 ? (
                <div className="flex justify-between text-muted">
                  <span>{t('orders.deliveryPrice')}:</span>
                  <span className="font-medium text-ink">+{formatNumber(watchedDeliveryPrice)} soʻm</span>
                </div>
              ) : null}
              <div className="mt-1 flex justify-between border-t border-line pt-2 text-[15px] font-semibold text-ink">
                <span>{t('orders.totalAmount')}</span>
                <span className="text-accent">{formatNumber(totalOrderSum)} soʻm</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? t('common.saving') : isEdit ? t('common.saveChanges') : t('orders.create')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
