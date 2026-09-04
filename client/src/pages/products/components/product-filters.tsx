import { Search } from 'lucide-react'
import { useCategories } from '@/api/categories'
import type { ProductStatus } from '@/api/types'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PRODUCT_STATUS_LABELS } from '@/lib/constants'

interface ProductFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  categoryId: string | undefined
  onCategoryChange: (value: string | undefined) => void
  status: ProductStatus | undefined
  onStatusChange: (value: ProductStatus | undefined) => void
}

export function ProductFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  status,
  onStatusChange,
}: ProductFiltersProps) {
  const { data: categories } = useCategories()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Поиск по названию или SKU"
          className="w-[240px] pl-8"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={categoryId ?? 'all'}
        onValueChange={(v) => onCategoryChange(v === 'all' ? undefined : v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Все категории" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все категории</SelectItem>
          {categories?.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={status ?? 'all'}
        onValueChange={(v) => onStatusChange(v === 'all' ? undefined : (v as ProductStatus))}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          {Object.entries(PRODUCT_STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
