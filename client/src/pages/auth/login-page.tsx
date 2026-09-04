import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { useLogin } from '@/api/auth'
import { apiErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { PHONE_REGEX, PHONE_PREFIX, PhoneInput } from '@/components/ui/phone-input'
import { useAuthStore } from '@/store/auth'
import { GEM_PANEL_BG, GemFacetPattern } from './components/gem-facet-pattern'

const schema = z.object({
  phone: z.string().regex(PHONE_REGEX, 'Введите номер полностью'),
  password: z.string().min(1, 'Введите пароль'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const token = useAuthStore((s) => s.token)
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: PHONE_PREFIX, password: '' },
  })

  if (token) {
    const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/'
    return <Navigate to={from} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login.mutateAsync(values)
      setSession(result.accessToken, result.user)
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Неверный телефон или пароль'))
    }
  })

  return (
    <>
      <title>Вход — Ювелир</title>
      <div className="grid min-h-screen md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <aside
          className="relative flex items-center justify-center overflow-hidden px-8 py-14 md:py-0"
          style={{ background: GEM_PANEL_BG }}
        >
          <div className="relative z-10 flex w-full max-w-[340px] flex-col items-center text-center">
            <div className="relative aspect-square w-full max-w-[220px]">
              <GemFacetPattern className="size-full" />
            </div>
            <h1 className="font-display mt-2 text-[32px] font-semibold text-[#EDEBE6]">Ювелир</h1>
            <p className="mt-3 text-[14px] leading-relaxed text-[#9A9E96]">
              Товар, склад, заказы и прибыль — в одном месте, до последнего сума.
            </p>
            <hr className="bevel-divider mt-6 w-24" />
          </div>
        </aside>

        <main className="flex items-center justify-center bg-canvas px-6 py-14">
          <div className="w-full max-w-[340px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-accent">
              Панель управления
            </p>
            <h2 className="font-display mt-2 text-balance text-[28px] font-semibold text-ink">
              С возвращением
            </h2>
            <p className="mt-2 text-[14px] text-muted">Войдите номером телефона, который вам выдал владелец магазина.</p>

            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Телефон</Label>
                <PhoneInput id="phone" value={watch('phone')} onChange={(v) => setValue('phone', v)} />
                {errors.phone ? <p className="text-[12px] text-danger">{errors.phone.message}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Пароль</Label>
                <PasswordInput id="password" {...register('password')} />
                {errors.password ? (
                  <p className="text-[12px] text-danger">{errors.password.message}</p>
                ) : null}
              </div>
              <Button type="submit" size="lg" className="mt-2 w-full" disabled={login.isPending}>
                {login.isPending ? 'Входим…' : 'Войти'}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}
