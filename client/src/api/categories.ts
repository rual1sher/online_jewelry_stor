import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type { Category } from './types'

export function useCategories(includeArchived = false) {
  return useQuery({
    queryKey: ['categories', includeArchived],
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>('/categories', {
        params: { includeArchived },
      })
      return data
    },
  })
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['categories'] })
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await apiClient.post<Category>('/categories', { name })
      return data
    },
    onSuccess: invalidate,
  })
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data } = await apiClient.patch<Category>(`/categories/${id}`, { name })
      return data
    },
    onSuccess: invalidate,
  })
}

export function useSetCategoryArchived() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const { data } = await apiClient.patch<Category>(
        `/categories/${id}/${isArchived ? 'archive' : 'unarchive'}`,
      )
      return data
    },
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/categories/${id}`)
    },
    onSuccess: invalidate,
  })
}
