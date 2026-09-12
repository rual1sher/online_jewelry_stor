import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type {
  DeliveryPayer,
  OrderDetail,
  OrderListItem,
  OrderStatus,
  Paginated,
  PaymentMethod,
  PaymentStatus,
} from './types'

export interface OrdersFilter {
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  from?: string
  to?: string
}

export function useOrders(filter: OrdersFilter) {
  return useQuery({
    queryKey: ['orders', filter],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<OrderListItem>>('/orders', {
        params: filter,
      })
      return data
    },
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await apiClient.get<OrderDetail>(`/orders/${id}`)
      return data
    },
    enabled: Boolean(id),
  })
}

export interface OrderItemInput {
  variantId: string
  quantity: number
  priceAtSale?: number
}

export interface CreateOrderPayload {
  items: OrderItemInput[]
  packagingId?: string | null
  packagingPrice?: number
  deliveryPrice?: number
  deliveryPaidBy?: DeliveryPayer
  comment?: string
}

function useInvalidateOrders() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    queryClient.invalidateQueries({ queryKey: ['inventory'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['finance'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })
    if (id) queryClient.invalidateQueries({ queryKey: ['order', id] })
  }
}

export function useCreateOrder() {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const { data } = await apiClient.post<OrderDetail>('/orders', payload)
      return data
    },
    onSuccess: () => invalidate(),
  })
}

export function useUpdateOrder() {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: async ({ id, ...payload }: CreateOrderPayload & { id: string }) => {
      const { data } = await apiClient.patch<OrderDetail>(`/orders/${id}`, payload)
      return data
    },
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useUpdateOrderStatus() {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: async ({
      id,
      status,
      comment,
    }: {
      id: string
      status: OrderStatus
      comment?: string
    }) => {
      const { data } = await apiClient.patch<OrderDetail>(`/orders/${id}/status`, {
        status,
        comment,
      })
      return data
    },
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useAddPayment() {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: async ({
      id,
      amount,
      method,
      comment,
    }: {
      id: string
      amount: number
      method: PaymentMethod
      comment?: string
    }) => {
      const { data } = await apiClient.post<OrderDetail>(`/orders/${id}/payments`, {
        amount,
        method,
        comment,
      })
      return data
    },
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useRefundPayment() {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: async ({
      id,
      amount,
      method,
      comment,
    }: {
      id: string
      amount: number
      method: PaymentMethod
      comment?: string
    }) => {
      const { data } = await apiClient.post<OrderDetail>(`/orders/${id}/refunds`, {
        amount,
        method,
        comment,
      })
      return data
    },
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useSetPaymentStatus() {
  const invalidate = useInvalidateOrders()
  return useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) => {
      const { data } = await apiClient.patch<OrderDetail>(`/orders/${id}/payment-status`, {
        paymentStatus,
      })
      return data
    },
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}
