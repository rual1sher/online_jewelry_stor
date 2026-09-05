import { PageHeader } from '@/components/common/page-header'
import { useT } from '@/lib/i18n'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseCategoriesSection } from './components/expense-categories-section'
import { ProductCategoriesSection } from './components/product-categories-section'
import { StoreSettingsForm } from './components/store-settings-form'
import { UsersManager } from './components/users-manager'

export function SettingsPage() {
  const t = useT()

  return (
    <div>
      <title>{`${t('settings.title')} — ${t('common.appName')}`}</title>
      <PageHeader title={t('settings.title')} />

      <Card className="p-5">
        <Tabs defaultValue="store">
          <TabsList>
            <TabsTrigger value="store">{t('settings.tabStore')}</TabsTrigger>
            <TabsTrigger value="product-categories">{t('settings.tabProductCategories')}</TabsTrigger>
            <TabsTrigger value="expense-categories">{t('settings.tabExpenseCategories')}</TabsTrigger>
            <TabsTrigger value="users">{t('settings.tabUsers')}</TabsTrigger>
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
