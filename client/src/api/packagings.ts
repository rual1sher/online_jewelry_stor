import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type { Packaging } from './types'

export function usePackagings(includeArchived = false) {
  return useQuery({
    queryKey: ['packagings', includeArchived],
    queryFn: async () => {
      const { data } = await apiClient.get<Packaging[]>('/packagings', {
        params: { includeArchived },
      })
      return data
    },
  })
}

function useInvalidatePackagings() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['packagings'] })
}

export function useCreatePackaging() {
  const invalidate = useInvalidatePackagings()
  return useMutation({
    mutationFn: async ({ name, price }: { name: string; price: number }) => {
      const { data } = await apiClient.post<Packaging>('/packagings', { name, price })
      return data
    },
    onSuccess: invalidate,
  })
}

export function useUpdatePackaging() {
  const invalidate = useInvalidatePackagings()
  return useMutation({
    mutationFn: async ({ id, name, price }: { id: string; name?: string; price?: number }) => {
      const { data } = await apiClient.patch<Packaging>(`/packagings/${id}`, { name, price })
      return data
    },
    onSuccess: invalidate,
  })
}

export function useSetPackagingArchived() {
  const invalidate = useInvalidatePackagings()
  return useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const { data } = await apiClient.patch<Packaging>(
        `/packagings/${id}/${isArchived ? 'archive' : 'unarchive'}`,
      )
      return data
    },
    onSuccess: invalidate,
  })
}

export function useDeletePackaging() {
  const invalidate = useInvalidatePackagings()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/packagings/${id}`)
    },
    onSuccess: invalidate,
  })
}
