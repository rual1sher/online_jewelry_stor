import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { apiErrorMessage } from '@/api/client'
import { useCreateReceipt } from '@/api/inventory'
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
import { Textarea } from '@/components/ui/textarea'
import { formatMoney } from '@/lib/format'

const schema = z.object({
  quantity: z.coerce.number().int().min(1, 'Минимум 1'),
  purchasePricePerUnit: z.number().int().min(0),
  packagingPrice: z.number().int().min(0),
  additionalCosts: z.number().int().min(0),
  comment: z.string().optional(),
})

type FormValues = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export interface ReceiptTargetVariant {
  id: string
  name: string
  currentStock: number
  averageCost: number
}

export function ReceiptDialog({
  variant,
  open,
  onOpenChange,
}: {
  variant: ReceiptTargetVariant
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createReceipt = useCreateReceipt()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
      purchasePricePerUnit: variant.averageCost,
      packagingPrice: 0,
      additionalCosts: 0,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        quantity: 1,
        purchasePricePerUnit: variant.averageCost,
        packagingPrice: 0,
        additionalCosts: 0,
      })
    }
  }, [open, variant, reset])

  const values = watch()
  const quantity = Number(values.quantity) || 0
  const unitCost =
    quantity > 0
      ? (values.purchasePricePerUnit || 0) +
        Math.round(((values.packagingPrice || 0) + (values.additionalCosts || 0)) / quantity)
      : 0

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      await createReceipt.mutateAsync({ variantId: variant.id, ...formValues })
      toast.success('Приход оформлен')
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось оформить приход'))
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Приход товара</DialogTitle>
        </DialogHeader>
        <p className="mb-2 text-[13px] text-muted">
          {variant.name} · остаток {variant.currentStock} шт.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantity">Количество</Label>
              <Input id="quantity" type="number" {...register('quantity')} />
              {errors.quantity ? (
                <p className="text-[12px] text-danger">{errors.quantity.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="purchasePricePerUnit">Цена закупки/шт</Label>
              <MoneyInput
                id="purchasePricePerUnit"
                value={watch('purchasePricePerUnit')}
                onChange={(v) => setValue('purchasePricePerUnit', v)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="packagingPrice">Цена упаковки</Label>
              <MoneyInput
                id="packagingPrice"
                value={watch('packagingPrice')}
                onChange={(v) => setValue('packagingPrice', v)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="additionalCosts">Доп. расходы</Label>
              <MoneyInput
                id="additionalCosts"
                value={watch('additionalCosts')}
                onChange={(v) => setValue('additionalCosts', v)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="receipt-comment">Комментарий</Label>
            <Textarea id="receipt-comment" rows={2} {...register('comment')} />
          </div>
          <div className="rounded-md bg-canvas p-3 text-[13px]">
            Себестоимость единицы: <span className="font-semibold">{formatMoney(unitCost)}</span>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={createReceipt.isPending}>
              {createReceipt.isPending ? 'Сохраняем…' : 'Оформить приход'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
