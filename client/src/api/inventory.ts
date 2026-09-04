import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type {
  AdjustmentReason,
  LowStockItem,
  Paginated,
  StockMovement,
  StockMovementType,
  StockTable,
} from './types'

export function useStockTable(includeArchived = false) {
  return useQuery({
    queryKey: ['inventory', 'stock', includeArchived],
    queryFn: async () => {
      const { data } = await apiClient.get<StockTable>('/inventory', {
        params: { includeArchived },
      })
      return data
    },
  })
}

export function useLowStock() {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: async () => {
      const { data } = await apiClient.get<LowStockItem[]>('/inventory/low-stock')
      return data
    },
  })
}

export interface MovementsFilter {
  page?: number
  limit?: number
  variantId?: string
  type?: StockMovementType
  from?: string
  to?: string
}

export function useMovements(filter: MovementsFilter) {
  return useQuery({
    queryKey: ['inventory', 'movements', filter],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<StockMovement>>('/inventory/movements', {
        params: filter,
      })
      return data
    },
  })
}

function useInvalidateInventory() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['product'] })
    queryClient.invalidateQueries({ queryKey: ['variant-history'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export interface CreateReceiptPayload {
  variantId: string
  quantity: number
  purchasePricePerUnit: number
  packagingPrice?: number
  additionalCosts?: number
  comment?: string
}

export function useCreateReceipt() {
  const invalidate = useInvalidateInventory()
  return useMutation({
    mutationFn: async (payload: CreateReceiptPayload) => {
      const { data } = await apiClient.post('/inventory/receipts', payload)
      return data
    },
    onSuccess: invalidate,
  })
}

export interface CreateAdjustmentPayload {
  variantId: string
  actualQuantity: number
  reason: AdjustmentReason
  comment?: string
}

export function useCreateAdjustment() {
  const invalidate = useInvalidateInventory()
  return useMutation({
    mutationFn: async (payload: CreateAdjustmentPayload) => {
      const { data } = await apiClient.post('/inventory/adjustments', payload)
      return data
    },
    onSuccess: invalidate,
  })
}
