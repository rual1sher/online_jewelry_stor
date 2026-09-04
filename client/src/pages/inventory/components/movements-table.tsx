import { useState } from 'react'
import { useMovements } from '@/api/inventory'
import type { StockMovementType } from '@/api/types'
import { EmptyState } from '@/components/common/empty-state'
import { Loading } from '@/components/common/loading'
import { Pagination } from '@/components/common/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ADJUSTMENT_REASON_LABELS, STOCK_MOVEMENT_LABELS } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'

const LIMIT = 20

export function MovementsTable() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState<StockMovementType | undefined>()
  const { data, isLoading } = useMovements({ page, limit: LIMIT, type })

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Select
          value={type ?? 'all'}
          onValueChange={(v) => {
            setType(v === 'all' ? undefined : (v as StockMovementType))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Все типы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            {Object.entries(STOCK_MOVEMENT_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading || !data ? (
        <Loading />
      ) : data.items.length === 0 ? (
        <EmptyState message="Движений по складу пока нет" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Изменение</TableHead>
                <TableHead>Остаток после</TableHead>
                <TableHead>Комментарий</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-muted">{formatDateTime(movement.createdAt)}</TableCell>
                  <TableCell className="font-medium">
                    {movement.variant?.product.name}
                    <div className="text-[12px] text-muted">{movement.variant?.name}</div>
                  </TableCell>
                  <TableCell>{STOCK_MOVEMENT_LABELS[movement.type]}</TableCell>
                  <TableCell
                    className={`tabular-nums font-medium ${movement.quantityChange < 0 ? 'text-danger' : 'text-success'}`}
                  >
                    {movement.quantityChange > 0 ? '+' : ''}
                    {movement.quantityChange}
                  </TableCell>
                  <TableCell className="tabular-nums">{movement.stockAfter}</TableCell>
                  <TableCell className="text-muted">
                    {movement.adjustmentReason ? ADJUSTMENT_REASON_LABELS[movement.adjustmentReason] : null}
                    {movement.comment ? ` ${movement.comment}` : ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} limit={LIMIT} total={data.total} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
