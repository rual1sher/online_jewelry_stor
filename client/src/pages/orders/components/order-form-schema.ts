import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Выберите товар'),
  variantId: z.string().min(1, 'Выберите вариант'),
  quantity: z.coerce.number().int().min(1, 'Минимум 1'),
  priceAtSale: z.number().int().min(0),
})

export const orderFormSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Добавьте хотя бы один товар'),
  deliveryPrice: z.number().int().min(0),
  deliveryPaidBy: z.enum(['CUSTOMER', 'STORE']),
  comment: z.string().optional(),
})

export type OrderFormValues = z.input<typeof orderFormSchema>
export type OrderFormOutput = z.output<typeof orderFormSchema>

export const emptyOrderItem = { productId: '', variantId: '', quantity: 1, priceAtSale: 0 }
