import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/api/client'
import { useSetVariantArchived } from '@/api/products'
import type { ProductVariant } from '@/api/types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { MoneyText } from '@/components/common/money-text'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { STOCK_STATUS_LABELS, STOCK_STATUS_TONE } from '@/lib/constants'
import { AdjustmentDialog } from '@/pages/inventory/components/adjustment-dialog'
import { ReceiptDialog } from '@/pages/inventory/components/receipt-dialog'
import { VariantDialog } from './variant-dialog'

function stockStatus(current: number, min: number) {
  if (current <= 0) return 'OUT' as const
  if (current <= min) return 'LOW' as const
  return 'SUFFICIENT' as const
}

export function VariantsTable({
  productId,
  variants,
  onSelectHistory,
}: {
  productId: string
  variants: ProductVariant[]
  onSelectHistory: (variantId: string) => void
}) {
  const [editVariant, setEditVariant] = useState<ProductVariant | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [receiptVariant, setReceiptVariant] = useState<ProductVariant | null>(null)
  const [adjustmentVariant, setAdjustmentVariant] = useState<ProductVariant | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<ProductVariant | null>(null)
  const setVariantArchived = useSetVariantArchived(productId)

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
          Добавить вариант
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Вариант</TableHead>
            <TableHead>Остаток</TableHead>
            <TableHead>Себестоимость</TableHead>
            <TableHead>Цена продажи</TableHead>
            <TableHead>Мин. остаток</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => {
            const status = stockStatus(variant.currentStock, variant.minStock)
            return (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">
                  {variant.name}
                  <div className="text-[12px] text-muted">{variant.sku}</div>
                </TableCell>
                <TableCell className="tabular-nums">{variant.currentStock}</TableCell>
                <TableCell>
                  <MoneyText amount={variant.averageCost} className="text-[13px]" />
                </TableCell>
                <TableCell>
                  <MoneyText amount={variant.sellingPrice} className="text-[13px]" />
                </TableCell>
                <TableCell className="tabular-nums text-muted">{variant.minStock}</TableCell>
                <TableCell>
                  {variant.isArchived ? (
                    <StatusBadge label="В архиве" tone="neutral" />
                  ) : (
                    <StatusBadge label={STOCK_STATUS_LABELS[status]} tone={STOCK_STATUS_TONE[status]} />
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditVariant(variant)}>
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setReceiptVariant(variant)}>
                        Оформить приход
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAdjustmentVariant(variant)}>
                        Скорректировать остаток
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSelectHistory(variant.id)}>
                        История движений
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setArchiveTarget(variant)}>
                        {variant.isArchived ? 'Вернуть из архива' : 'Архивировать'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <VariantDialog productId={productId} open={addOpen} onOpenChange={setAddOpen} />
      {editVariant ? (
        <VariantDialog
          productId={productId}
          variant={editVariant}
          open={Boolean(editVariant)}
          onOpenChange={(open) => !open && setEditVariant(null)}
        />
      ) : null}
      {receiptVariant ? (
        <ReceiptDialog
          variant={receiptVariant}
          open={Boolean(receiptVariant)}
          onOpenChange={(open) => !open && setReceiptVariant(null)}
        />
      ) : null}
      {adjustmentVariant ? (
        <AdjustmentDialog
          variant={adjustmentVariant}
          open={Boolean(adjustmentVariant)}
          onOpenChange={(open) => !open && setAdjustmentVariant(null)}
        />
      ) : null}
      {archiveTarget ? (
        <ConfirmDialog
          open={Boolean(archiveTarget)}
          onOpenChange={(open) => !open && setArchiveTarget(null)}
          title={archiveTarget.isArchived ? 'Вернуть вариант из архива?' : 'Архивировать вариант?'}
          description={
            archiveTarget.isArchived
              ? 'Вариант снова станет доступен для продажи.'
              : 'Вариант пропадёт из продажи и активного склада, но останется в истории.'
          }
          confirmLabel={archiveTarget.isArchived ? 'Вернуть' : 'Архивировать'}
          onConfirm={async () => {
            try {
              await setVariantArchived.mutateAsync({
                variantId: archiveTarget.id,
                isArchived: !archiveTarget.isArchived,
              })
              toast.success(archiveTarget.isArchived ? 'Вариант возвращён из архива' : 'Вариант архивирован')
            } catch (error) {
              toast.error(apiErrorMessage(error))
            }
          }}
        />
      ) : null}
    </div>
  )
}
