import { MoreHorizontal, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/api/client'
import type { Category, ExpenseCategory } from '@/api/types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useT } from '@/lib/i18n'

type CategoryLike = Category | ExpenseCategory

interface CategoriesManagerProps {
  categories: CategoryLike[] | undefined
  onCreate: (name: string) => Promise<unknown>
  onRename: (id: string, name: string) => Promise<unknown>
  onArchiveToggle: (id: string, isArchived: boolean) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}

export function CategoriesManager({
  categories,
  onCreate,
  onRename,
  onArchiveToggle,
  onDelete,
}: CategoriesManagerProps) {
  const t = useT()
  const [newName, setNewName] = useState('')
  const [renameTarget, setRenameTarget] = useState<CategoryLike | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<CategoryLike | null>(null)

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await onCreate(newName.trim())
      setNewName('')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          placeholder={t('settings.newCategory')}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <Button type="button" onClick={handleCreate}>
          <Plus className="size-4" /> {t('common.add')}
        </Button>
      </div>

      {!categories || categories.length === 0 ? (
        <EmptyState message={t('settings.categoriesEmpty')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('field.name')}</TableHead>
              <TableHead>{t('field.status')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  {category.isArchived ? (
                    <StatusBadge label={t('productStatus.ARCHIVED')} tone="neutral" />
                  ) : (
                    <StatusBadge label={t('settings.categoryActive')} tone="success" />
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
                      <DropdownMenuItem
                        onClick={() => {
                          setRenameTarget(category)
                          setRenameValue(category.name)
                        }}
                      >
                        {t('common.rename')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            await onArchiveToggle(category.id, !category.isArchived)
                          } catch (error) {
                            toast.error(apiErrorMessage(error))
                          }
                        }}
                      >
                        {category.isArchived ? t('common.unarchive') : t('common.archive')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(category)}>
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

      <Dialog open={Boolean(renameTarget)} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="max-w-[360px]">
          <DialogHeader>
            <DialogTitle>{t('settings.renameCategory')}</DialogTitle>
          </DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setRenameTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (!renameTarget || !renameValue.trim()) return
                try {
                  await onRename(renameTarget.id, renameValue.trim())
                  setRenameTarget(null)
                } catch (error) {
                  toast.error(apiErrorMessage(error))
                }
              }}
            >
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('settings.deleteCategoryTitle')}
        description={t('settings.deleteCategoryText')}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await onDelete(deleteTarget.id)
            toast.success(t('settings.categoryDeleted'))
          } catch (error) {
            toast.error(apiErrorMessage(error))
          }
        }}
      />
    </div>
  )
}
