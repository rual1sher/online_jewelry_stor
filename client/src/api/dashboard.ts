import { useQuery } from '@tanstack/react-query'
import { apiClient } from './client'
import type { DashboardOverview } from './types'

export function useDashboard(from: string, to: string) {
  return useQuery({
    queryKey: ['dashboard', from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardOverview>('/dashboard', {
        params: { from, to },
      })
      return data
    },
  })
}
