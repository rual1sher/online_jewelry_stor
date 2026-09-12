import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useCategories, useCreateCategory } from '@/api/categories'
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
  minStock: z.coerce.number().int().min(0).optional().default(0),
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

  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const createCategory = useCreateCategory()

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
      setShowNewCategory(false)
      setNewCategoryName('')
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
      <DialogContent className="max-w-[700px] max-h-[92vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
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
                <div className="flex items-center justify-between">
                  <Label>{t('field.category')}</Label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                    className="text-[12px] text-accent hover:underline"
                  >
                    {showNewCategory ? t('common.cancel') : `+ ${t('settings.newCategory')}`}
                  </button>
                </div>
                {showNewCategory ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('settings.newCategory')}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="h-9 text-[13px]"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        if (!newCategoryName.trim()) return
                        try {
                          const res = await createCategory.mutateAsync(newCategoryName.trim())
                          setValue('categoryId', res.id, { shouldValidate: true })
                          setNewCategoryName('')
                          setShowNewCategory(false)
                          toast.success(t('common.save'))
                        } catch (e) {
                          toast.error(apiErrorMessage(e))
                        }
                      }}
                    >
                      {t('common.add')}
                    </Button>
                  </div>
                ) : (
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
                )}
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
                <div
                  key={field.id}
                  className="relative flex flex-col gap-3 rounded-lg border border-line bg-canvas/60 p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-1 flex-col gap-1">
                      <Label className="text-[12px] font-medium text-muted">
                        {t('variant.nameSize')}
                      </Label>
                      <Input
                        placeholder={t('variant.defaultName')}
                        {...register(`variants.${index}.name` as const)}
                      />
                    </div>
                    {variants.fields.length > 1 ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="mt-5 shrink-0 text-danger hover:bg-danger/10"
                        onClick={() => variants.remove(index)}
                        title={t('common.delete')}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-[12px] text-muted">{t('field.cost')}</Label>
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
                    <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
                      <Label className="text-[12px] text-muted">{t('field.stock')}</Label>
                      <Input
                        type="number"
                        min={0}
                        {...register(`variants.${index}.stock` as const)}
                      />
                    </div>
                  </div>
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

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
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
