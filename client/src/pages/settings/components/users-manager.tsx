import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSetUserActive, useUsers } from '@/api/auth'
import { apiErrorMessage } from '@/api/client'
import type { User } from '@/api/types'
import { EmptyState } from '@/components/common/empty-state'
import { Loading } from '@/components/common/loading'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { USER_ROLE_LABELS } from '@/lib/constants'
import { UserFormDialog } from './user-form-dialog'

export function UsersManager() {
  const { data, isLoading } = useUsers()
  const setActive = useSetUserActive()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | undefined>()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditTarget(undefined)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" /> Новый пользователь
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : !data || data.length === 0 ? (
        <EmptyState message="Пользователей пока нет" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Активен</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted">{user.phone}</TableCell>
                <TableCell>{USER_ROLE_LABELS[user.role]}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={user.isActive ? 'Активен' : 'Отключён'}
                    tone={user.isActive ? 'success' : 'neutral'}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.isActive}
                    onCheckedChange={async (checked) => {
                      try {
                        await setActive.mutateAsync({ id: user.id, isActive: checked })
                      } catch (error) {
                        toast.error(apiErrorMessage(error))
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditTarget(user)
                      setFormOpen(true)
                    }}
                  >
                    Редактировать
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <UserFormDialog user={editTarget} open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
