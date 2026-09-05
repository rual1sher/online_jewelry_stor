import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useRegisterUser, useUpdateUser } from '@/api/auth'
import { apiErrorMessage } from '@/api/client'
import type { User } from '@/api/types'
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
import { PasswordInput } from '@/components/ui/password-input'
import { PHONE_PREFIX, PHONE_REGEX, PhoneInput } from '@/components/ui/phone-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { USER_ROLES, USER_ROLE_KEY } from '@/lib/constants'
import { useT, type TKey } from '@/lib/i18n'

const schema = z.object({
  phone: z.string().optional(),
  name: z.string().min(1, 'settings.nameRequired'),
  role: z.enum(['OWNER', 'MANAGER']),
  password: z.string().min(6, 'settings.passwordMin').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export function UserFormDialog({
  user,
  open,
  onOpenChange,
}: {
  user?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useT()
  const isEdit = Boolean(user)
  const registerUser = useRegisterUser()
  const updateUser = useUpdateUser()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    if (user) {
      reset({ phone: user.phone, name: user.name, role: user.role, password: '' })
    } else {
      reset({ phone: PHONE_PREFIX, name: '', role: 'MANAGER', password: '' })
    }
  }, [open, user, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (user) {
        await updateUser.mutateAsync({
          id: user.id,
          name: values.name,
          role: values.role,
          password: values.password || undefined,
        })
        toast.success(t('settings.userUpdated'))
      } else {
        if (!values.phone || !PHONE_REGEX.test(values.phone)) {
          toast.error(t('settings.phoneRequired'))
          return
        }
        if (!values.password || values.password.length < 6) {
          toast.error(t('settings.passwordTooShort'))
          return
        }
        await registerUser.mutateAsync({
          phone: values.phone,
          password: values.password,
          name: values.name,
          role: values.role,
        })
        toast.success(t('settings.userCreated'))
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, t('settings.userSaveFailed')))
    }
  })

  const pending = registerUser.isPending || updateUser.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('settings.editUser') : t('settings.newUser')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-phone">{t('field.phone')}</Label>
            <PhoneInput
              id="user-phone"
              disabled={isEdit}
              value={watch('phone') || PHONE_PREFIX}
              onChange={(v) => setValue('phone', v)}
            />
            {errors.phone ? (
              <p className="text-[12px] text-danger">{t(errors.phone.message as TKey)}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-name">{t('settings.userName')}</Label>
            <Input id="user-name" {...register('name')} />
            {errors.name ? (
              <p className="text-[12px] text-danger">{t(errors.name.message as TKey)}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t('field.role')}</Label>
            <Select value={watch('role')} onValueChange={(v) => setValue('role', v as 'OWNER' | 'MANAGER')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {t(USER_ROLE_KEY[role])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-password">{isEdit ? t('settings.newPassword') : t('field.password')}</Label>
            <PasswordInput id="user-password" {...register('password')} />
            {errors.password ? (
              <p className="text-[12px] text-danger">{t(errors.password.message as TKey)}</p>
            ) : null}
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
