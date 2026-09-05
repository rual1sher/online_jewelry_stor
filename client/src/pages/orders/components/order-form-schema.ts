import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'orders.productRequired'),
  variantId: z.string().min(1, 'orders.variantRequired'),
  quantity: z.coerce.number().int().min(1, 'validation.minOne'),
  priceAtSale: z.number().int().min(0),
})

export const orderFormSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'orders.itemRequired'),
  deliveryPrice: z.number().int().min(0),
  deliveryPaidBy: z.enum(['CUSTOMER', 'STORE']),
  comment: z.string().optional(),
})

export type OrderFormValues = z.input<typeof orderFormSchema>
export type OrderFormOutput = z.output<typeof orderFormSchema>

export const emptyOrderItem = { productId: '', variantId: '', quantity: 1, priceAtSale: 0 }
