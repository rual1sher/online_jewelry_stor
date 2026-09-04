import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: ReactNode
  delta?: { value: number; positive: boolean } | null
  active?: boolean
  className?: string
}

export function MetricCard({ label, value, delta, active, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-line bg-surface p-4',
        className,
      )}
    >
      {active ? <div className="bevel-divider absolute inset-x-0 top-0" /> : null}
      <div className="text-[12px] font-medium uppercase tracking-[0.03em] text-muted">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="tabular-nums text-[28px] font-bold text-ink">{value}</span>
        {delta ? (
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[12px] font-medium',
              delta.positive ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger',
            )}
          >
            {delta.positive ? '+' : ''}
            {delta.value}%
          </span>
        ) : null}
      </div>
    </div>
  )
}
