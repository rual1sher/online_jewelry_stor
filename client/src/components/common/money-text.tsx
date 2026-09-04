import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

interface MoneyTextProps {
  amount: number
  className?: string
  tone?: 'default' | 'accent' | 'success' | 'danger'
}

const toneClass: Record<NonNullable<MoneyTextProps['tone']>, string> = {
  default: 'text-ink',
  accent: 'text-accent',
  success: 'text-success',
  danger: 'text-danger',
}

export function MoneyText({ amount, className, tone = 'default' }: MoneyTextProps) {
  return (
    <span className={cn('tabular-nums font-semibold', toneClass[tone], className)}>
      {formatMoney(amount)}
    </span>
  )
}
