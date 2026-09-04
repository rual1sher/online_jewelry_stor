import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useSetCategoryArchived,
  useUpdateCategory,
} from '@/api/categories'
import { CategoriesManager } from './categories-manager'

export function ProductCategoriesSection() {
  const { data } = useCategories(true)
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const setArchived = useSetCategoryArchived()
  const deleteCategory = useDeleteCategory()

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
