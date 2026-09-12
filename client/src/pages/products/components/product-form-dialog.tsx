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
import { useT, type TKey } from '@/lib/i18n'

const variantSchema = z.object({
  name: z.string().min(1, 'validation.name'),
  stock: z.coerce.number().int().min(0).optional(),
  costPrice: z.number().int().min(0).optional(),
  sellingPrice: z.number().int().min(0, 'validation.notNegative'),
  minStock: z.coerce.number().int().min(0).optional(),
})

const schema = z.object({
  name: z.string().min(1, 'products.nameRequired'),
  categoryId: z.string().min(1, 'validation.category'),
  description: z.string().optional(),
  imageUrls: z.array(z.object({ url: z.string().min(1, 'products.imageLinkRequired') })),
  variants: z.array(variantSchema).min(1, 'products.variantRequired'),
})

type FormValues = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

const emptyVariant = { stock: 0, costPrice: 0, sellingPrice: 0, minStock: 0 }

export function ProductFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useT()
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
    defaultValues: {
      name: '',
      categoryId: '',
      imageUrls: [],
      variants: [{ ...emptyVariant, name: t('variant.defaultName') }],
    },
  })

  const variants = useFieldArray({ control, name: 'variants' })
  const images = useFieldArray({ control, name: 'imageUrls' })

  useEffect(() => {
    if (open) {
      reset({
        name: '',
        categoryId: '',
        imageUrls: [],
        variants: [{ ...emptyVariant, name: t('variant.defaultName') }],
      })
    }
  }, [open, reset, t])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createProduct.mutateAsync({
        ...values,
        imageUrls: values.imageUrls.map((i) => i.url),
      })
      toast.success(t('products.created'))
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, t('products.createFailed')))
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{t('products.newTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <section className="rounded-md border border-line p-4">
            <h3 className="mb-3 text-[15px] font-semibold text-ink">{t('products.mainSection')}</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">{t('products.nameField')}</Label>
                <Input id="name" {...register('name')} />
                {errors.name ? (
                  <p className="text-[12px] text-danger">{t(errors.name.message as TKey)}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t('field.category')}</Label>
                <Select
                  value={watch('categoryId')}
                  onValueChange={(v) => setValue('categoryId', v, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('validation.category')} />
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
                  <p className="text-[12px] text-danger">{t(errors.categoryId.message as TKey)}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">{t('field.description')}</Label>
                <Textarea id="description" rows={3} {...register('description')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t('products.imagesLinks')}</Label>
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
                  <Plus className="size-4" /> {t('products.addImage')}
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-line p-4">
            <h3 className="mb-3 text-[15px] font-semibold text-ink">{t('products.variantsSection')}</h3>
            {errors.variants?.message ? (
              <p className="mb-2 text-[12px] text-danger">{t(errors.variants.message as TKey)}</p>
            ) : null}
            <div className="flex flex-col gap-3">
              {variants.fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1.2fr_0.8fr_1fr_1fr_0.7fr_auto] items-end gap-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-[12px] text-muted">{t('variant.nameSizeShort')}</Label>
                    <Input {...register(`variants.${index}.name` as const)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-[12px] text-muted">{t('field.stock')}</Label>
                    <Input type="number" {...register(`variants.${index}.stock` as const)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-[12px] text-muted">{t('variant.costPriceShort')}</Label>
                    <MoneyInput
                      value={watch(`variants.${index}.costPrice` as const) ?? 0}
                      onChange={(v) => setValue(`variants.${index}.costPrice`, v)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-[12px] text-muted">{t('field.sellingPrice')}</Label>
                    <MoneyInput
                      value={watch(`variants.${index}.sellingPrice` as const)}
                      onChange={(v) => setValue(`variants.${index}.sellingPrice`, v)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-[12px] text-muted">{t('field.minStock')}</Label>
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
                onClick={() => variants.append({ ...emptyVariant, name: t('variant.defaultName') })}
              >
                <Plus className="size-4" /> {t('variant.add')}
              </Button>
            </div>
          </section>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending ? t('common.saving') : t('products.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
