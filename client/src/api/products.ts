import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type {
  Paginated,
  ProductDetail,
  ProductListItem,
  ProductStatus,
  StockMovement,
} from './types'

export interface ProductsFilter {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  status?: ProductStatus
}

export function useProducts(filter: ProductsFilter) {
  return useQuery({
    queryKey: ['products', filter],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<ProductListItem>>('/products', {
        params: filter,
      })
      return data
    },
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductDetail>(`/products/${id}`)
      return data
    },
    enabled: Boolean(id),
  })
}

export function useVariantHistory(variantId: string | undefined) {
  return useQuery({
    queryKey: ['variant-history', variantId],
    queryFn: async () => {
      const { data } = await apiClient.get<StockMovement[]>(
        `/products/variants/${variantId}/history`,
      )
      return data
    },
    enabled: Boolean(variantId),
  })
}

export interface VariantInput {
  name: string
  stock?: number
  costPrice?: number
  sellingPrice: number
  minStock?: number
}

export interface CreateProductPayload {
  name: string
  description?: string
  categoryId: string
  imageUrls?: string[]
  variants: VariantInput[]
}

function useInvalidateProducts() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    if (id) queryClient.invalidateQueries({ queryKey: ['product', id] })
  }
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const { data } = await apiClient.post<ProductDetail>('/products', payload)
      return data
    },
    onSuccess: () => invalidate(),
  })
}

export interface UpdateProductPayload {
  name?: string
  description?: string
  categoryId?: string
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateProductPayload & { id: string }) => {
      const { data } = await apiClient.patch<ProductDetail>(`/products/${id}`, payload)
      return data
    },
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useSetProductArchived() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const { data } = await apiClient.patch<ProductDetail>(
        `/products/${id}/${isArchived ? 'archive' : 'unarchive'}`,
      )
      return data
    },
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useAddVariant() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: async ({ productId, ...payload }: VariantInput & { productId: string }) => {
      const { data } = await apiClient.post(`/products/${productId}/variants`, payload)
      return data
    },
    onSuccess: (_data, variables) => invalidate(variables.productId),
  })
}

export function useUpdateVariant(productId?: string) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: async ({
      variantId,
      ...payload
    }: Partial<VariantInput> & { variantId: string }) => {
      const { data } = await apiClient.patch(`/products/variants/${variantId}`, payload)
      return data
    },
    onSuccess: () => invalidate(productId),
  })
}

export function useSetVariantArchived(productId?: string) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: async ({
      variantId,
      isArchived,
    }: {
      variantId: string
      isArchived: boolean
    }) => {
      const { data } = await apiClient.patch(
        `/products/variants/${variantId}/${isArchived ? 'archive' : 'unarchive'}`,
      )
      return data
    },
    onSuccess: () => invalidate(productId),
  })
}

export function useAddImage(productId?: string) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: async ({ url, sortOrder }: { url: string; sortOrder?: number }) => {
      const { data } = await apiClient.post(`/products/${productId}/images`, {
        url,
        sortOrder,
      })
      return data
    },
    onSuccess: () => invalidate(productId),
  })
}

export function useRemoveImage(productId?: string) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: async (imageId: string) => {
      await apiClient.delete(`/products/images/${imageId}`)
    },
    onSuccess: () => invalidate(productId),
  })
}
