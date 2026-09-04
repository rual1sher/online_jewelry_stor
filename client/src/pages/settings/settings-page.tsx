import { PageHeader } from '@/components/common/page-header'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseCategoriesSection } from './components/expense-categories-section'
import { ProductCategoriesSection } from './components/product-categories-section'
import { StoreSettingsForm } from './components/store-settings-form'
import { UsersManager } from './components/users-manager'

export function SettingsPage() {
  return (
    <div>
      <title>Настройки — Ювелир</title>
      <PageHeader title="Настройки" />

      <Card className="p-5">
        <Tabs defaultValue="store">
          <TabsList>
            <TabsTrigger value="store">Магазин</TabsTrigger>
            <TabsTrigger value="product-categories">Категории товаров</TabsTrigger>
            <TabsTrigger value="expense-categories">Категории расходов</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
          </TabsList>
          <TabsContent value="store">
            <StoreSettingsForm />
          </TabsContent>
          <TabsContent value="product-categories">
            <ProductCategoriesSection />
          </TabsContent>
          <TabsContent value="expense-categories">
            <ExpenseCategoriesSection />
          </TabsContent>
          <TabsContent value="users">
            <UsersManager />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
