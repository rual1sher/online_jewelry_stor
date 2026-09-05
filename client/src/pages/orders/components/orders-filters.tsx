import { Search } from 'lucide-react'
import type { OrderStatus, PaymentStatus } from '@/api/types'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ORDER_STATUSES,
  ORDER_STATUS_KEY,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_KEY,
} from '@/lib/constants'
import { useT } from '@/lib/i18n'

interface OrdersFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: OrderStatus | undefined
  onStatusChange: (value: OrderStatus | undefined) => void
  paymentStatus: PaymentStatus | undefined
  onPaymentStatusChange: (value: PaymentStatus | undefined) => void
}

export function OrdersFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  paymentStatus,
  onPaymentStatusChange,
}: OrdersFiltersProps) {
  const t = useT()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder={t('orders.search')}
          className="w-[220px] pl-8"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={status ?? 'all'}
        onValueChange={(v) => onStatusChange(v === 'all' ? undefined : (v as OrderStatus))}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder={t('orders.statusFilter')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.allStatuses')}</SelectItem>
          {ORDER_STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {t(ORDER_STATUS_KEY[value])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={paymentStatus ?? 'all'}
        onValueChange={(v) => onPaymentStatusChange(v === 'all' ? undefined : (v as PaymentStatus))}
      >
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder={t('orders.paymentFilter')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('orders.allPaymentStatuses')}</SelectItem>
          {PAYMENT_STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {t(PAYMENT_STATUS_KEY[value])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
