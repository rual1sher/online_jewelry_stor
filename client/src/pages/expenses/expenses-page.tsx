import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useExpenseCategories } from '@/api/expenseCategories'
import { apiErrorMessage } from '@/api/client'
import { useDeleteExpense, useExpenses } from '@/api/expenses'
import type { Expense } from '@/api/types'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { DateRangeFilter } from '@/components/common/date-range-filter'
import { EmptyState } from '@/components/common/empty-state'
import { Loading } from '@/components/common/loading'
import { MetricCard } from '@/components/common/metric-card'
import { MoneyText } from '@/components/common/money-text'
import { PageHeader } from '@/components/common/page-header'
import { Pagination } from '@/components/common/pagination'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLocalDateRange } from '@/lib/dateRange'
import { formatDate } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { ExpenseFormDialog } from './components/expense-form-dialog'

const LIMIT = 20

export function ExpensesPage() {
  const t = useT()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const { preset, customFrom, customTo, setPreset, setCustomRange, iso } = useLocalDateRange()
  const { data: categories } = useExpenseCategories()
  const { data, isLoading } = useExpenses({
    page,
    limit: LIMIT,
    search: search || undefined,
    categoryId,
    from: iso.from,
    to: iso.to,
  })
  const deleteExpense = useDeleteExpense()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Expense | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)

  return (
    <div>
      <title>{`${t('expenses.title')} — ${t('common.appName')}`}</title>
      <PageHeader
        title={t('expenses.title')}
        actions={
          <Button
            onClick={() => {
              setEditTarget(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" /> {t('expenses.add')}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder={t('expenses.search')}
              className="w-[220px] pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <Select
            value={categoryId ?? 'all'}
            onValueChange={(v) => {
              setCategoryId(v === 'all' ? undefined : v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder={t('common.allCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.allCategories')}</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DateRangeFilter
          preset={preset}
          customFrom={customFrom}
          customTo={customTo}
          onPresetChange={setPreset}
          onCustomRangeChange={setCustomRange}
        />
      </div>

      {data ? (
        <div className="mb-4">
          <MetricCard
            label={t('expenses.periodTotal')}
            value={<MoneyText amount={data.totalAmount} />}
            active
          />
        </div>
      ) : null}

      <Card className="overflow-hidden">
        {isLoading || !data ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <EmptyState message={t('expenses.empty')} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('field.name')}</TableHead>
                  <TableHead>{t('field.category')}</TableHead>
                  <TableHead>{t('field.amount')}</TableHead>
                  <TableHead>{t('field.date')}</TableHead>
                  <TableHead>{t('field.comment')}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell className="text-muted">{expense.category.name}</TableCell>
                    <TableCell>
                      <MoneyText amount={expense.amount} className="text-[13px]" />
                    </TableCell>
                    <TableCell className="text-muted">{formatDate(expense.date)}</TableCell>
                    <TableCell className="text-muted">{expense.comment}</TableCell>
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
                              setEditTarget(expense)
                              setFormOpen(true)
                            }}
                          >
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(expense)}>
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} limit={LIMIT} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <ExpenseFormDialog expense={editTarget} open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('expenses.deleteTitle')}
        description={t('common.undoable')}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteExpense.mutateAsync(deleteTarget.id)
            toast.success(t('expenses.deleted'))
          } catch (error) {
            toast.error(apiErrorMessage(error))
          }
        }}
      />
    </div>
  )
}
