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
          placeholder="Название новой категории"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <Button type="button" onClick={handleCreate}>
          <Plus className="size-4" /> Добавить
        </Button>
      </div>

      {!categories || categories.length === 0 ? (
        <EmptyState message="Категорий пока нет" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  {category.isArchived ? (
                    <StatusBadge label="В архиве" tone="neutral" />
                  ) : (
                    <StatusBadge label="Активна" tone="success" />
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
                        Переименовать
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
                        {category.isArchived ? 'Вернуть из архива' : 'Архивировать'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(category)}>Удалить</DropdownMenuItem>
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
            <DialogTitle>Переименовать категорию</DialogTitle>
          </DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setRenameTarget(null)}>
              Отмена
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
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Удалить категорию?"
        description="Категорию с товарами/расходами удалить нельзя — сначала архивируйте её."
        confirmLabel="Удалить"
        danger
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await onDelete(deleteTarget.id)
            toast.success('Категория удалена')
          } catch (error) {
            toast.error(apiErrorMessage(error))
          }
        }}
      />
    </div>
  )
}
