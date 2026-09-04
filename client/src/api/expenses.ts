import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type { Expense, Paginated } from './types'

export interface ExpensesFilter {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  from?: string
  to?: string
}

export type ExpensesPage = Paginated<Expense> & { totalAmount: number }

export function useExpenses(filter: ExpensesFilter) {
  return useQuery({
    queryKey: ['expenses', filter],
    queryFn: async () => {
      const { data } = await apiClient.get<ExpensesPage>('/expenses', { params: filter })
      return data
    },
  })
}

export interface ExpensePayload {
  categoryId: string
  title: string
  amount: number
  date?: string
  comment?: string
  receiptPhotoUrl?: string
}

function useInvalidateExpenses() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] })
    queryClient.invalidateQueries({ queryKey: ['finance'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useCreateExpense() {
  const invalidate = useInvalidateExpenses()
  return useMutation({
    mutationFn: async (payload: ExpensePayload) => {
      const { data } = await apiClient.post<Expense>('/expenses', payload)
      return data
    },
    onSuccess: invalidate,
  })
}

export function useUpdateExpense() {
  const invalidate = useInvalidateExpenses()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<ExpensePayload> & { id: string }) => {
      const { data } = await apiClient.patch<Expense>(`/expenses/${id}`, payload)
      return data
    },
    onSuccess: invalidate,
  })
}

export function useDeleteExpense() {
  const invalidate = useInvalidateExpenses()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/expenses/${id}`)
    },
    onSuccess: invalidate,
  })
}
