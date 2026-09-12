import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { apiErrorMessage } from '@/api/client'
import { useAddVariant, useUpdateVariant } from '@/api/products'
import type { ProductVariant } from '@/api/types'
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
import { useT, type TKey } from '@/lib/i18n'

const schema = z.object({
  name: z.string().min(1, 'validation.name'),
  costPrice: z.number().int().min(0).optional(),
  sellingPrice: z.number().int().min(0),
  stock: z.coerce.number().int().min(0).optional(),
  minStock: z.coerce.number().int().min(0).optional().default(0),
})

type FormValues = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function VariantDialog({
  productId,
  variant,
  open,
  onOpenChange,
}: {
  productId: string
  variant?: ProductVariant
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useT()
  const addVariant = useAddVariant()
  const updateVariant = useUpdateVariant(productId)
  const isEdit = Boolean(variant)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset(
        variant
          ? {
              name: variant.name,
              costPrice: variant.averageCost,
              sellingPrice: variant.sellingPrice,
              stock: variant.currentStock,
              minStock: variant.minStock,
            }
          : { name: '', costPrice: 0, sellingPrice: 0, stock: 0, minStock: 0 },
      )
    }
  }, [open, variant, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (variant) {
        await updateVariant.mutateAsync({ variantId: variant.id, ...values })
        toast.success(t('variant.updated'))
      } else {
        await addVariant.mutateAsync({ productId, ...values })
        toast.success(t('variant.created'))
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, t('variant.saveFailed')))
    }
  })

  const pending = addVariant.isPending || updateVariant.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('variant.editTitle') : t('variant.newTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="variant-name">{t('variant.nameSize')}</Label>
            <Input id="variant-name" {...register('name')} />
            {errors.name ? (
              <p className="text-[12px] text-danger">{t(errors.name.message as TKey)}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="variant-cost">{t('variant.costPrice')}</Label>
              <MoneyInput id="variant-cost" value={watch('costPrice') ?? 0} onChange={(v) => setValue('costPrice', v)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="variant-price">{t('field.sellingPrice')}</Label>
              <MoneyInput id="variant-price" value={watch('sellingPrice')} onChange={(v) => setValue('sellingPrice', v)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="variant-stock">{t('field.stock')}</Label>
            <Input id="variant-stock" type="number" min={0} {...register('stock')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
