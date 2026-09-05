import { Eye, EyeOff } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { useState } from 'react'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Input } from './input'

export function PasswordInput({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const t = useT()
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-9', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-ink"
        aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
