import { useQuery } from '@tanstack/react-query'
import { apiClient } from './client'
import type { TopProduct } from './types'

export function useRevenueDynamics(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'revenue', from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<{ date: string; revenue: number }[]>(
        '/reports/revenue-dynamics',
        { params: { from, to } },
      )
      return data
    },
  })
}

export function useProfitDynamics(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'profit', from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<{ date: string; profit: number }[]>(
        '/reports/profit-dynamics',
        { params: { from, to } },
      )
      return data
    },
  })
}

export function useExpenseDynamics(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'expenses', from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<{ date: string; amount: number }[]>(
        '/reports/expense-dynamics',
        { params: { from, to } },
      )
      return data
    },
  })
}

export function useTopSelling(from: string, to: string, limit = 10) {
  return useQuery({
    queryKey: ['reports', 'top-selling', from, to, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<TopProduct[]>('/reports/top-selling', {
        params: { from, to, limit },
      })
      return data
    },
  })
}

export function useTopProfitable(from: string, to: string, limit = 10) {
  return useQuery({
    queryKey: ['reports', 'top-profitable', from, to, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<TopProduct[]>('/reports/top-profitable', {
        params: { from, to, limit },
      })
      return data
    },
  })
}
