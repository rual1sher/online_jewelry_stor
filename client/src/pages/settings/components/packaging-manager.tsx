import { MoreHorizontal, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/api/client'
import {
  useCreatePackaging,
  useDeletePackaging,
  usePackagings,
  useSetPackagingArchived,
  useUpdatePackaging,
} from '@/api/packagings'
import type { Packaging } from '@/api/types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { MoneyText } from '@/components/common/money-text'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoneyInput } from '@/components/ui/money-input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useT } from '@/lib/i18n'

export function PackagingManager() {
  const t = useT()
  const { data: packagings } = usePackagings(true)
  const createPackaging = useCreatePackaging()
  const updatePackaging = useUpdatePackaging()
  const setArchived = useSetPackagingArchived()
  const deletePackaging = useDeletePackaging()

  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState(0)

  const [editTarget, setEditTarget] = useState<Packaging | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState(0)

  const [deleteTarget, setDeleteTarget] = useState<Packaging | null>(null)

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await createPackaging.mutateAsync({ name: newName.trim(), price: newPrice })
      setNewName('')
      setNewPrice(0)
      toast.success(t('common.save'))
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const handleEditSave = async () => {
    if (!editTarget || !editName.trim()) return
    try {
      await updatePackaging.mutateAsync({
        id: editTarget.id,
        name: editName.trim(),
        price: editPrice,
      })
      setEditTarget(null)
      toast.success(t('common.save'))
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <Label htmlFor="new-packaging-name">{t('settings.newPackagingName')}</Label>
          <Input
            id="new-packaging-name"
            placeholder={t('settings.newPackagingName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <div className="flex w-[160px] flex-col gap-1.5">
          <Label htmlFor="new-packaging-price">{t('settings.newPackagingPrice')}</Label>
          <MoneyInput
            id="new-packaging-price"
            value={newPrice}
            onChange={(v) => setNewPrice(v)}
          />
        </div>
        <Button type="button" onClick={handleCreate} disabled={createPackaging.isPending}>
          <Plus className="size-4" /> {t('common.add')}
        </Button>
      </div>

      {!packagings || packagings.length === 0 ? (
        <EmptyState message={t('settings.packagingEmpty')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('field.name')}</TableHead>
              <TableHead>{t('field.pricePerUnit')}</TableHead>
              <TableHead>{t('field.status')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {packagings.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>
                  <MoneyText amount={pkg.price} className="text-[13px]" />
                </TableCell>
                <TableCell>
                  {pkg.isArchived ? (
                    <StatusBadge label={t('productStatus.ARCHIVED')} tone="neutral" />
                  ) : (
                    <StatusBadge label={t('settings.packagingActive')} tone="success" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditTarget(pkg)
                          setEditName(pkg.name)
                          setEditPrice(pkg.price)
                        }}
                      >
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            await setArchived.mutateAsync({
                              id: pkg.id,
                              isArchived: !pkg.isArchived,
                            })
                          } catch (error) {
                            toast.error(apiErrorMessage(error))
                          }
                        }}
                      >
                        {pkg.isArchived ? t('common.unarchive') : t('common.archive')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(pkg)}>
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={Boolean(editTarget)} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('settings.editPackaging')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t('settings.newPackagingName')}</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('settings.newPackagingPrice')}</Label>
              <MoneyInput value={editPrice} onChange={(v) => setEditPrice(v)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setEditTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={handleEditSave} disabled={updatePackaging.isPending}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('settings.deletePackagingTitle')}
        description={t('settings.deletePackagingText')}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deletePackaging.mutateAsync(deleteTarget.id)
            toast.success(t('settings.packagingDeleted'))
          } catch (error) {
            toast.error(apiErrorMessage(error))
          }
        }}
      />
    </div>
  )
}
