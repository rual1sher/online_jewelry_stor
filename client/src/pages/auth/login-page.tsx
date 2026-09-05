import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { useLogin } from '@/api/auth'
import { apiErrorMessage } from '@/api/client'
import { LangSwitcher } from '@/components/common/lang-switcher'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { PHONE_REGEX, PHONE_PREFIX, PhoneInput } from '@/components/ui/phone-input'
import { useT } from '@/lib/i18n'
import { useAuthStore } from '@/store/auth'
import { GEM_PANEL_BG, GemFacetPattern } from './components/gem-facet-pattern'

const schema = z.object({
  phone: z.string().regex(PHONE_REGEX, 'auth.phoneIncomplete'),
  password: z.string().min(1, 'auth.passwordRequired'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const t = useT()
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
      toast.error(apiErrorMessage(error, t('auth.invalidCredentials')))
    }
  })

  return (
    <>
      <title>{`${t('auth.title')} — ${t('common.appName')}`}</title>
      <div className="grid min-h-screen md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <aside
          className="relative flex items-center justify-center overflow-hidden px-8 py-14 md:py-0"
          style={{ background: GEM_PANEL_BG }}
        >
          <div className="relative z-10 flex w-full max-w-[340px] flex-col items-center text-center">
            <div className="relative aspect-square w-full max-w-[220px]">
              <GemFacetPattern className="size-full" />
            </div>
            <h1 className="font-display mt-2 text-[32px] font-semibold text-[#F2ECE7]">
              {t('common.appName')}
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-[#A99C95]">{t('common.tagline')}</p>
            <hr className="bevel-divider mt-6 w-24" />
          </div>
        </aside>

        <main className="relative flex items-center justify-center bg-canvas px-6 py-14">
          <div className="absolute right-5 top-5">
            <LangSwitcher />
          </div>
          <div className="w-full max-w-[340px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-accent">
              {t('auth.badge')}
            </p>
            <h2 className="font-display mt-2 text-balance text-[28px] font-semibold text-ink">
              {t('auth.heading')}
            </h2>
            <p className="mt-2 text-[14px] text-muted">{t('auth.subtitle')}</p>

            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">{t('field.phone')}</Label>
                <PhoneInput id="phone" value={watch('phone')} onChange={(v) => setValue('phone', v)} />
                {errors.phone ? (
                  <p className="text-[12px] text-danger">{t('auth.phoneIncomplete')}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">{t('field.password')}</Label>
                <PasswordInput id="password" {...register('password')} />
                {errors.password ? (
                  <p className="text-[12px] text-danger">{t('auth.passwordRequired')}</p>
                ) : null}
              </div>
              <Button type="submit" size="lg" className="mt-2 w-full" disabled={login.isPending}>
                {login.isPending ? t('auth.submitting') : t('auth.submit')}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}
