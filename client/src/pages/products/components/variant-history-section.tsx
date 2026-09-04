import { useVariantHistory } from '@/api/products'
import type { ProductVariant } from '@/api/types'
import { EmptyState } from '@/components/common/empty-state'
import { Loading } from '@/components/common/loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { STOCK_MOVEMENT_LABELS, ADJUSTMENT_REASON_LABELS } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'

export function VariantHistorySection({
  variants,
  selectedVariantId,
  onSelect,
}: {
  variants: ProductVariant[]
  selectedVariantId: string | undefined
  onSelect: (variantId: string) => void
}) {
  const { data, isLoading } = useVariantHistory(selectedVariantId)

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Select value={selectedVariantId} onValueChange={onSelect}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Выберите вариант" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <Loading />
      ) : !data || data.length === 0 ? (
        <EmptyState message="История по этому варианту пока пуста" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Изменение</TableHead>
              <TableHead>Остаток после</TableHead>
              <TableHead>Себестоимость</TableHead>
              <TableHead>Комментарий</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="text-muted">{formatDateTime(movement.createdAt)}</TableCell>
                <TableCell>{STOCK_MOVEMENT_LABELS[movement.type]}</TableCell>
                <TableCell
                  className={`tabular-nums font-medium ${movement.quantityChange < 0 ? 'text-danger' : 'text-success'}`}
                >
                  {movement.quantityChange > 0 ? '+' : ''}
                  {movement.quantityChange}
                </TableCell>
                <TableCell className="tabular-nums">{movement.stockAfter}</TableCell>
                <TableCell className="tabular-nums text-muted">{movement.costAtMovement}</TableCell>
                <TableCell className="text-muted">
                  {movement.adjustmentReason ? ADJUSTMENT_REASON_LABELS[movement.adjustmentReason] : null}
                  {movement.comment ? ` ${movement.comment}` : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
