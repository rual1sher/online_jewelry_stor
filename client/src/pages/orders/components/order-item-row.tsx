import { Trash2 } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { useProduct, useProducts } from '@/api/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoneyInput } from '@/components/ui/money-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatMoney } from '@/lib/format'
import { useT, type TKey } from '@/lib/i18n'
import type { OrderFormValues } from './order-form-schema'

export function OrderItemRow({ index, onRemove, canRemove }: { index: number; onRemove: () => void; canRemove: boolean }) {
  const t = useT()
  const { watch, setValue, register, formState: { errors } } = useFormContext<OrderFormValues>()
  const { data: products } = useProducts({ status: 'ACTIVE', limit: 100 })
  const productId = watch(`items.${index}.productId`)
  const variantId = watch(`items.${index}.variantId`)
  const { data: product } = useProduct(productId || undefined)

  const itemErrors = errors.items?.[index]

  return (
    <div className="grid grid-cols-[1.4fr_1.1fr_0.7fr_0.9fr_auto] items-end gap-2 rounded-md border border-line p-3">
      <div className="flex flex-col gap-1">
        <Label className="text-[12px] text-muted">{t('field.product')}</Label>
        <Select
          value={productId}
          onValueChange={(v) => {
            setValue(`items.${index}.productId`, v)
            setValue(`items.${index}.variantId`, '')
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('orders.selectProduct')} />
          </SelectTrigger>
          <SelectContent>
            {products?.items.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[12px] text-muted">{t('field.variant')}</Label>
        <Select
          value={variantId}
          onValueChange={(v) => {
            setValue(`items.${index}.variantId`, v)
            const variant = product?.variants.find((item) => item.id === v)
            if (variant) setValue(`items.${index}.priceAtSale`, variant.sellingPrice)
          }}
          disabled={!productId}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('field.variant')} />
          </SelectTrigger>
          <SelectContent>
            {product?.variants
              .filter((v) => !v.isArchived)
              .map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name} · {formatMoney(v.sellingPrice)} · {t('orders.stockShort')} {v.currentStock}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {itemErrors?.variantId ? (
          <p className="text-[12px] text-danger">{t(itemErrors.variantId.message as TKey)}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[12px] text-muted">{t('field.quantity')}</Label>
        <Input type="number" {...register(`items.${index}.quantity` as const)} />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[12px] text-muted">{t('field.pricePerUnit')}</Label>
        <MoneyInput
          value={watch(`items.${index}.priceAtSale` as const)}
          onChange={(v) => setValue(`items.${index}.priceAtSale`, v)}
        />
      </div>
      <Button type="button" variant="secondary" size="icon" disabled={!canRemove} onClick={onRemove}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
