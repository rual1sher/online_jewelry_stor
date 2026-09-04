import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/format'
import { emptyOrderItem, type OrderFormValues } from './order-form-schema'
import { OrderItemRow } from './order-item-row'

export function OrderItemsEditor() {
  const { control, watch } = useFormContext<OrderFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => (
        <OrderItemRow key={field.id} index={index} onRemove={() => remove(index)} canRemove={fields.length > 1} />
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => append(emptyOrderItem)}
      >
        <Plus className="size-4" /> Добавить товар
      </Button>
      <ItemsTotal items={items} />
    </div>
  )
}

function ItemsTotal({ items }: { items: OrderFormValues['items'] }) {
  const total = items.reduce((sum, item) => {
    const price = Number(item.priceAtSale) || 0
    return sum + price * (Number(item.quantity) || 0)
  }, 0)

  return (
    <div className="text-right text-[13px] text-muted">
      Сумма товаров: <span className="font-semibold text-ink">{formatMoney(total)}</span>
    </div>
  )
}
