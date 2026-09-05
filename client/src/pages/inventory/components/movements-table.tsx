import { useState } from 'react'
import { useMovements } from '@/api/inventory'
import type { StockMovementType } from '@/api/types'
import { EmptyState } from '@/components/common/empty-state'
import { Loading } from '@/components/common/loading'
import { Pagination } from '@/components/common/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ADJUSTMENT_REASON_KEY, STOCK_MOVEMENT_KEY, STOCK_MOVEMENT_TYPES } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { useT } from '@/lib/i18n'

const LIMIT = 20

export function MovementsTable() {
  const t = useT()
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
            <SelectValue placeholder={t('common.allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.allTypes')}</SelectItem>
            {STOCK_MOVEMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(STOCK_MOVEMENT_KEY[type])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading || !data ? (
        <Loading />
      ) : data.items.length === 0 ? (
        <EmptyState message={t('inventory.movementsEmpty')} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('field.date')}</TableHead>
                <TableHead>{t('field.product')}</TableHead>
                <TableHead>{t('field.type')}</TableHead>
                <TableHead>{t('field.change')}</TableHead>
                <TableHead>{t('field.stockAfter')}</TableHead>
                <TableHead>{t('field.comment')}</TableHead>
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
                  <TableCell>{t(STOCK_MOVEMENT_KEY[movement.type])}</TableCell>
                  <TableCell
                    className={`tabular-nums font-medium ${movement.quantityChange < 0 ? 'text-danger' : 'text-success'}`}
                  >
                    {movement.quantityChange > 0 ? '+' : ''}
                    {movement.quantityChange}
                  </TableCell>
                  <TableCell className="tabular-nums">{movement.stockAfter}</TableCell>
                  <TableCell className="text-muted">
                    {movement.adjustmentReason ? t(ADJUSTMENT_REASON_KEY[movement.adjustmentReason]) : null}
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
