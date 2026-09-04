import {
  useCreateExpenseCategory,
  useDeleteExpenseCategory,
  useExpenseCategories,
  useSetExpenseCategoryArchived,
  useUpdateExpenseCategory,
} from '@/api/expenseCategories'
import { CategoriesManager } from './categories-manager'

export function ExpenseCategoriesSection() {
  const { data } = useExpenseCategories(true)
  const createCategory = useCreateExpenseCategory()
  const updateCategory = useUpdateExpenseCategory()
  const setArchived = useSetExpenseCategoryArchived()
  const deleteCategory = useDeleteExpenseCategory()

  return (
    <CategoriesManager
      categories={data}
      onCreate={(name) => createCategory.mutateAsync(name)}
      onRename={(id, name) => updateCategory.mutateAsync({ id, name })}
      onArchiveToggle={(id, isArchived) => setArchived.mutateAsync({ id, isArchived })}
      onDelete={(id) => deleteCategory.mutateAsync(id)}
    />
  )
}
