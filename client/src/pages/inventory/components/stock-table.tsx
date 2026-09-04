import { useState } from 'react'
import { useStockTable } from '@/api/inventory'
import type { StockTableItem } from '@/api/types'
import { EmptyState } from '@/components/common/empty-state'
import { Loading } from '@/components/common/loading'
import { MoneyText } from '@/components/common/money-text'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { STOCK_STATUS_LABELS, STOCK_STATUS_TONE } from '@/lib/constants'
import { AdjustmentDialog } from './adjustment-dialog'
import { ReceiptDialog } from './receipt-dialog'

export function StockTable() {
  const [includeArchived, setIncludeArchived] = useState(false)
  const { data, isLoading } = useStockTable(includeArchived)
  const [receiptTarget, setReceiptTarget] = useState<StockTableItem | null>(null)
  const [adjustmentTarget, setAdjustmentTarget] = useState<StockTableItem | null>(null)

  return (
    <div>
      <div className="mb-3 flex items-center justify-end gap-2">
        <label className="flex items-center gap-2 text-[13px] text-muted">
          <Switch checked={includeArchived} onCheckedChange={setIncludeArchived} />
          Показывать архивные
        </label>
      </div>
      {isLoading || !data ? (
        <Loading />
      ) : data.items.length === 0 ? (
        <EmptyState message="На складе пока нет товаров" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Товар</TableHead>
              <TableHead>Вариант</TableHead>
              <TableHead>Остаток</TableHead>
              <TableHead>Себестоимость</TableHead>
              <TableHead>Стоимость на складе</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item) => (
              <TableRow key={item.variantId}>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell className="text-muted">{item.variantName}</TableCell>
                <TableCell className="tabular-nums">{item.currentStock}</TableCell>
                <TableCell>
                  <MoneyText amount={item.averageCost} className="text-[13px]" />
                </TableCell>
                <TableCell>
                  <MoneyText amount={item.stockValue} className="text-[13px]" />
                </TableCell>
                <TableCell>
                  <StatusBadge label={STOCK_STATUS_LABELS[item.status]} tone={STOCK_STATUS_TONE[item.status]} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="secondary" size="sm" onClick={() => setReceiptTarget(item)}>
                      Приход
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setAdjustmentTarget(item)}>
                      Корректировка
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {receiptTarget ? (
        <ReceiptDialog
          variant={{
            id: receiptTarget.variantId,
            name: `${receiptTarget.productName} — ${receiptTarget.variantName}`,
            currentStock: receiptTarget.currentStock,
            averageCost: receiptTarget.averageCost,
          }}
          open={Boolean(receiptTarget)}
          onOpenChange={(open) => !open && setReceiptTarget(null)}
        />
      ) : null}
      {adjustmentTarget ? (
        <AdjustmentDialog
          variant={{
            id: adjustmentTarget.variantId,
            name: `${adjustmentTarget.productName} — ${adjustmentTarget.variantName}`,
            currentStock: adjustmentTarget.currentStock,
          }}
          open={Boolean(adjustmentTarget)}
          onOpenChange={(open) => !open && setAdjustmentTarget(null)}
        />
      ) : null}
    </div>
  )
}
