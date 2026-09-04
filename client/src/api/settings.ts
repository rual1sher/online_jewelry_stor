import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type { StoreSettings } from './types'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<StoreSettings>('/settings')
      return data
    },
  })
}

export interface UpdateSettingsPayload {
  storeName?: string
  logoUrl?: string
  currency?: string
  defaultMinStock?: number
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateSettingsPayload) => {
      const { data } = await apiClient.patch<StoreSettings>('/settings', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })
}
