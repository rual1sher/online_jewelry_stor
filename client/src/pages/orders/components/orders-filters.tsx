import { Search } from 'lucide-react'
import type { OrderStatus, PaymentStatus } from '@/api/types'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants'

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
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Поиск по номеру заказа"
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
          <SelectValue placeholder="Статус заказа" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={paymentStatus ?? 'all'}
        onValueChange={(v) => onPaymentStatusChange(v === 'all' ? undefined : (v as PaymentStatus))}
      >
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder="Статус оплаты" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы оплаты</SelectItem>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
