import { useMutation } from '@tanstack/react-query'
import { apiClient } from './client'

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await apiClient.post<{ url: string }>('/uploads/image', formData)
      return data
    },
  })
}
