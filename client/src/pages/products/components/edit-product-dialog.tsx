import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useCategories } from '@/api/categories'
import { apiErrorMessage } from '@/api/client'
import { useUpdateProduct } from '@/api/products'
import type { ProductDetail } from '@/api/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  name: z.string().min(1, 'Укажите название'),
  sku: z.string().min(1, 'Укажите код'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function EditProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: ProductDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: categories } = useCategories()
  const updateProduct = useUpdateProduct()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset({
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        description: product.description ?? '',
      })
    }
  }, [open, product, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProduct.mutateAsync({ id: product.id, ...values })
      toast.success('Товар обновлён')
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось обновить товар'))
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать товар</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">Название</Label>
              <Input id="edit-name" {...register('name')} />
              {errors.name ? <p className="text-[12px] text-danger">{errors.name.message}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-sku">Код (SKU)</Label>
              <Input id="edit-sku" {...register('sku')} />
              {errors.sku ? <p className="text-[12px] text-danger">{errors.sku.message}</p> : null}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Категория</Label>
            <Select
              value={watch('categoryId')}
              onValueChange={(v) => setValue('categoryId', v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-description">Описание</Label>
            <Textarea id="edit-description" rows={3} {...register('description')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={updateProduct.isPending}>
              {updateProduct.isPending ? 'Сохраняем…' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
