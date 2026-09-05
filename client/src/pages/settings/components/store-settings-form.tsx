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
import { useT, type TKey } from '@/lib/i18n'

const schema = z.object({
  storeName: z.string().min(1, 'settings.storeNameRequired'),
  logoUrl: z.string().optional(),
  currency: z.string().min(1),
  defaultMinStock: z.coerce.number().int().min(0),
})

type FormValues = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function StoreSettingsForm() {
  const t = useT()
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
      toast.success(t('settings.saved'))
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex max-w-[420px] flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="storeName">{t('settings.storeName')}</Label>
        <Input id="storeName" {...register('storeName')} />
        {errors.storeName ? (
          <p className="text-[12px] text-danger">{t(errors.storeName.message as TKey)}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="logoUrl">{t('settings.logo')}</Label>
        <ImageUploadField value={watch('logoUrl') ?? ''} onChange={(url) => setValue('logoUrl', url)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">{t('settings.currency')}</Label>
          <Input id="currency" {...register('currency')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="defaultMinStock">{t('settings.defaultMinStock')}</Label>
          <Input id="defaultMinStock" type="number" {...register('defaultMinStock')} />
        </div>
      </div>
      <Button type="submit" className="mt-2 self-start" disabled={updateSettings.isPending}>
        {updateSettings.isPending ? t('common.saving') : t('common.save')}
      </Button>
    </form>
  )
}
