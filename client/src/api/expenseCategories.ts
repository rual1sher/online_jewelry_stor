import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type { ExpenseCategory } from './types'

export function useExpenseCategories(includeArchived = false) {
  return useQuery({
    queryKey: ['expense-categories', includeArchived],
    queryFn: async () => {
      const { data } = await apiClient.get<ExpenseCategory[]>('/expense-categories', {
        params: { includeArchived },
      })
      return data
    },
  })
}

function useInvalidateExpenseCategories() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
}

export function useCreateExpenseCategory() {
  const invalidate = useInvalidateExpenseCategories()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await apiClient.post<ExpenseCategory>('/expense-categories', { name })
      return data
    },
    onSuccess: invalidate,
  })
}

export function useUpdateExpenseCategory() {
  const invalidate = useInvalidateExpenseCategories()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data } = await apiClient.patch<ExpenseCategory>(`/expense-categories/${id}`, {
        name,
      })
      return data
    },
    onSuccess: invalidate,
  })
}

export function useSetExpenseCategoryArchived() {
  const invalidate = useInvalidateExpenseCategories()
  return useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const { data } = await apiClient.patch<ExpenseCategory>(
        `/expense-categories/${id}/${isArchived ? 'archive' : 'unarchive'}`,
      )
      return data
    },
    onSuccess: invalidate,
  })
}

export function useDeleteExpenseCategory() {
  const invalidate = useInvalidateExpenseCategories()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/expense-categories/${id}`)
    },
    onSuccess: invalidate,
  })
}
