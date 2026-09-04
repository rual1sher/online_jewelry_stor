import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { apiErrorMessage } from '@/api/client'
import { useCreateAdjustment } from '@/api/inventory'
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
import { ADJUSTMENT_REASON_LABELS } from '@/lib/constants'

const schema = z.object({
  actualQuantity: z.coerce.number().int().min(0),
  reason: z.enum(['LOST', 'DAMAGED', 'MISCOUNTED', 'OTHER']),
  comment: z.string().optional(),
})

type FormValues = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export interface AdjustmentTargetVariant {
  id: string
  name: string
  currentStock: number
}

export function AdjustmentDialog({
  variant,
  open,
  onOpenChange,
}: {
  variant: AdjustmentTargetVariant
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createAdjustment = useCreateAdjustment()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { actualQuantity: variant.currentStock, reason: 'MISCOUNTED' },
  })

  useEffect(() => {
    if (open) {
      reset({ actualQuantity: variant.currentStock, reason: 'MISCOUNTED' })
    }
  }, [open, variant, reset])

  const actualQuantity = Number(watch('actualQuantity')) || 0
  const diff = actualQuantity - variant.currentStock

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAdjustment.mutateAsync({ variantId: variant.id, ...values })
      toast.success('Остаток скорректирован')
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось скорректировать остаток'))
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Корректировка остатка</DialogTitle>
        </DialogHeader>
        <p className="mb-2 text-[13px] text-muted">
          {variant.name} · в системе {variant.currentStock} шт.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="actualQuantity">Фактический остаток</Label>
            <Input id="actualQuantity" type="number" {...register('actualQuantity')} />
            {errors.actualQuantity ? (
              <p className="text-[12px] text-danger">{errors.actualQuantity.message}</p>
            ) : null}
          </div>
          <p className={`text-[13px] font-medium ${diff < 0 ? 'text-danger' : diff > 0 ? 'text-success' : 'text-muted'}`}>
            Разница: {diff > 0 ? '+' : ''}
            {diff} шт.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label>Причина</Label>
            <Select value={watch('reason')} onValueChange={(v) => setValue('reason', v as FormValues['reason'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ADJUSTMENT_REASON_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adjustment-comment">Комментарий</Label>
            <Textarea id="adjustment-comment" rows={2} {...register('comment')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={createAdjustment.isPending || diff === 0}>
              {createAdjustment.isPending ? 'Сохраняем…' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
