import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { apiErrorMessage } from '@/api/client'
import { useSettings, useUpdateSettings } from '@/api/settings'
import { ImageUploadField } from '@/components/common/image-upload-field'
import { Loading } from '@/components/common/loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  storeName: z.string().min(1, 'Укажите название магазина'),
  logoUrl: z.string().optional(),
  currency: z.string().min(1),
  defaultMinStock: z.coerce.number().int().min(0),
})

type FormValues = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function StoreSettingsForm() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (settings) {
      reset({
        storeName: settings.storeName,
        logoUrl: settings.logoUrl ?? '',
        currency: settings.currency,
        defaultMinStock: settings.defaultMinStock,
      })
    }
  }, [settings, reset])

  if (isLoading || !settings) return <Loading />

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateSettings.mutateAsync(values)
      toast.success('Настройки сохранены')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex max-w-[420px] flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="storeName">Название магазина</Label>
        <Input id="storeName" {...register('storeName')} />
        {errors.storeName ? <p className="text-[12px] text-danger">{errors.storeName.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="logoUrl">Логотип</Label>
        <ImageUploadField value={watch('logoUrl') ?? ''} onChange={(url) => setValue('logoUrl', url)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">Валюта</Label>
          <Input id="currency" {...register('currency')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="defaultMinStock">Мин. остаток по умолчанию</Label>
          <Input id="defaultMinStock" type="number" {...register('defaultMinStock')} />
        </div>
      </div>
      <Button type="submit" className="mt-2 self-start" disabled={updateSettings.isPending}>
        {updateSettings.isPending ? 'Сохраняем…' : 'Сохранить'}
      </Button>
    </form>
  )
}
