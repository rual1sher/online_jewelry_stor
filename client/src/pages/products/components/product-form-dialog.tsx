import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useCategories } from '@/api/categories'
import { apiErrorMessage } from '@/api/client'
import { useCreateProduct } from '@/api/products'
import { ImageUploadField } from '@/components/common/image-upload-field'
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
import { MoneyInput } from '@/components/ui/money-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const variantSchema = z.object({
  name: z.string().min(1, 'Укажите название'),
  sku: z.string().min(1, 'Укажите код'),
  sellingPrice: z.number().int().min(0, 'Не может быть отрицательной'),
  minStock: z.coerce.number().int().min(0).optional(),
})

const schema = z.object({
  name: z.string().min(1, 'Укажите название товара'),
  sku: z.string().min(1, 'Укажите код товара'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  description: z.string().optional(),
  imageUrls: z.array(z.object({ url: z.string().min(1, 'Введите ссылку на изображение') })),
  variants: z.array(variantSchema).min(1, 'Добавьте хотя бы один вариант'),
})

type FormValues = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

const emptyVariant = { name: 'Стандарт', sku: '', sellingPrice: 0, minStock: 0 }

export function ProductFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', sku: '', categoryId: '', imageUrls: [], variants: [emptyVariant] },
  })

  const variants = useFieldArray({ control, name: 'variants' })
  const images = useFieldArray({ control, name: 'imageUrls' })

  useEffect(() => {
    if (open) {
      reset({ name: '', sku: '', categoryId: '', imageUrls: [], variants: [emptyVariant] })
    }
  }, [open, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createProduct.mutateAsync({
        ...values,
        imageUrls: values.imageUrls.map((i) => i.url),
      })
      toast.success('Товар добавлен')
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось добавить товар'))
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Новый товар</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <section className="rounded-md border border-line p-4">
            <h3 className="mb-3 text-[15px] font-semibold text-ink">Основные данные</h3>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Название товара</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name ? <p className="text-[12px] text-danger">{errors.name.message}</p> : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sku">Код товара (SKU)</Label>
                  <Input id="sku" {...register('sku')} />
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
                {errors.categoryId ? (
                  <p className="text-[12px] text-danger">{errors.categoryId.message}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Описание</Label>
                <Textarea id="description" rows={3} {...register('description')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Изображения (ссылки)</Label>
                {images.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <ImageUploadField
                      value={watch(`imageUrls.${index}.url` as const) ?? ''}
                      onChange={(url) => setValue(`imageUrls.${index}.url`, url)}
                    />
                    <Button type="button" variant="secondary" size="icon" onClick={() => images.remove(index)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  onClick={() => images.append({ url: '' })}
                >
                  <Plus className="size-4" /> Добавить изображение
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-line p-4">
            <h3 className="mb-3 text-[15px] font-semibold text-ink">Варианты и размеры</h3>
            {errors.variants?.message ? (
              <p className="mb-2 text-[12px] text-danger">{errors.variants.message}</p>
            ) : null}
            <div className="flex flex-col gap-3">
              {variants.fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr_auto] items-end gap-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-[12px] text-muted">Название/размер</Label>
                    <Input {...register(`variants.${index}.name` as const)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-[12px] text-muted">Код</Label>
                    <Input {...register(`variants.${index}.sku` as const)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-[12px] text-muted">Цена продажи</Label>
                    <MoneyInput
                      value={watch(`variants.${index}.sellingPrice` as const)}
                      onChange={(v) => setValue(`variants.${index}.sellingPrice`, v)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-[12px] text-muted">Мин. остаток</Label>
                    <Input type="number" {...register(`variants.${index}.minStock` as const)} />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    disabled={variants.fields.length <= 1}
                    onClick={() => variants.remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="self-start"
                onClick={() => variants.append(emptyVariant)}
              >
                <Plus className="size-4" /> Добавить вариант
              </Button>
            </div>
          </section>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending ? 'Сохраняем…' : 'Создать товар'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
