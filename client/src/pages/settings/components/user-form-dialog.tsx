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
import { USER_ROLE_LABELS } from '@/lib/constants'

const schema = z.object({
  phone: z.string().optional(),
  name: z.string().min(1, 'Укажите имя'),
  role: z.enum(['OWNER', 'MANAGER']),
  password: z.string().min(6, 'Минимум 6 символов').optional().or(z.literal('')),
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
        toast.success('Пользователь обновлён')
      } else {
        if (!values.phone || !PHONE_REGEX.test(values.phone)) {
          toast.error('Введите номер телефона полностью')
          return
        }
        if (!values.password || values.password.length < 6) {
          toast.error('Пароль должен быть не короче 6 символов')
          return
        }
        await registerUser.mutateAsync({
          phone: values.phone,
          password: values.password,
          name: values.name,
          role: values.role,
        })
        toast.success('Пользователь создан')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось сохранить пользователя'))
    }
  })

  const pending = registerUser.isPending || updateUser.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать пользователя' : 'Новый пользователь'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-phone">Телефон</Label>
            <PhoneInput
              id="user-phone"
              disabled={isEdit}
              value={watch('phone') || PHONE_PREFIX}
              onChange={(v) => setValue('phone', v)}
            />
            {errors.phone ? <p className="text-[12px] text-danger">{errors.phone.message}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-name">Имя</Label>
            <Input id="user-name" {...register('name')} />
            {errors.name ? <p className="text-[12px] text-danger">{errors.name.message}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Роль</Label>
            <Select value={watch('role')} onValueChange={(v) => setValue('role', v as 'OWNER' | 'MANAGER')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(USER_ROLE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-password">{isEdit ? 'Новый пароль (необязательно)' : 'Пароль'}</Label>
            <PasswordInput id="user-password" {...register('password')} />
            {errors.password ? <p className="text-[12px] text-danger">{errors.password.message}</p> : null}
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
