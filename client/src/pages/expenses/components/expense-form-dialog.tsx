import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useExpenseCategories } from '@/api/expenseCategories'
import { apiErrorMessage } from '@/api/client'
import { useCreateExpense, useUpdateExpense } from '@/api/expenses'
import type { Expense } from '@/api/types'
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
import { toInputDate } from '@/lib/format'

const schema = z.object({
  categoryId: z.string().min(1, 'Выберите категорию'),
  title: z.string().min(1, 'Укажите название'),
  amount: z.number().int().min(1, 'Сумма должна быть больше 0'),
  date: z.string().optional(),
  comment: z.string().optional(),
  receiptPhotoUrl: z.string().optional(),
})

type FormValues = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function ExpenseFormDialog({
  expense,
  open,
  onOpenChange,
}: {
  expense?: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: categories } = useExpenseCategories()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const isEdit = Boolean(expense)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    if (expense) {
      reset({
        categoryId: expense.categoryId,
        title: expense.title,
        amount: expense.amount,
        date: toInputDate(expense.date),
        comment: expense.comment ?? '',
        receiptPhotoUrl: expense.receiptPhotoUrl ?? '',
      })
    } else {
      reset({ categoryId: '', title: '', amount: 0, date: toInputDate(new Date()) })
    }
  }, [open, expense, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (expense) {
        await updateExpense.mutateAsync({ id: expense.id, ...values })
        toast.success('Расход обновлён')
      } else {
        await createExpense.mutateAsync(values)
        toast.success('Расход добавлен')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось сохранить расход'))
    }
  })

  const pending = createExpense.isPending || updateExpense.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать расход' : 'Новый расход'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expense-title">Название расхода</Label>
            <Input id="expense-title" {...register('title')} />
            {errors.title ? <p className="text-[12px] text-danger">{errors.title.message}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Категория</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(v) => setValue('categoryId', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Категория" />
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
              <Label htmlFor="expense-amount">Сумма</Label>
              <MoneyInput id="expense-amount" value={watch('amount')} onChange={(v) => setValue('amount', v)} />
              {errors.amount ? <p className="text-[12px] text-danger">{errors.amount.message}</p> : null}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expense-date">Дата</Label>
            <Input id="expense-date" type="date" {...register('date')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expense-comment">Комментарий</Label>
            <Textarea id="expense-comment" rows={2} {...register('comment')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expense-receipt">Фото чека (необязательно)</Label>
            <ImageUploadField
              value={watch('receiptPhotoUrl') ?? ''}
              onChange={(url) => setValue('receiptPhotoUrl', url)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Сохраняем…' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
