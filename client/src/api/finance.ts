import { useQuery } from '@tanstack/react-query'
import { apiClient } from './client'
import type { FinancialSummary } from './types'

export function useFinanceSummary(from: string, to: string) {
  return useQuery({
    queryKey: ['finance', 'summary', from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<FinancialSummary>('/finance/summary', {
        params: { from, to },
      })
      return data
    },
  })
}
