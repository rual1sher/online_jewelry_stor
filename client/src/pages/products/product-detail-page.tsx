import { ArrowLeft, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/api/client'
import { useProduct, useSetProductArchived } from '@/api/products'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { Loading } from '@/components/common/loading'
import { MetricCard } from '@/components/common/metric-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PRODUCT_STATUS_KEY, PRODUCT_STATUS_TONE } from '@/lib/constants'
import { formatMoney } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { EditProductDialog } from './components/edit-product-dialog'
import { ImageManager } from './components/image-manager'
import { VariantHistorySection } from './components/variant-history-section'
import { VariantsTable } from './components/variants-table'

export function ProductDetailPage() {
  const t = useT()
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading } = useProduct(id)
  const setProductArchived = useSetProductArchived()

  const [editOpen, setEditOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [historyVariantId, setHistoryVariantId] = useState<string | undefined>(undefined)
  const [tab, setTab] = useState('variants')

  if (isLoading || !product) return <Loading />

  const cover = product.images[0]?.url

  return (
    <div>
      <title>{`${product.name} — ${t('common.appName')}`}</title>
      <Link to="/products" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> {t('products.backToList')}
      </Link>

      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 md:flex-row">
        <div className="size-24 shrink-0 overflow-hidden rounded-md bg-canvas">
          {cover ? <img src={cover} alt="" className="size-full object-cover" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-[24px] font-semibold text-ink">{product.name}</h1>
            <StatusBadge
              label={t(PRODUCT_STATUS_KEY[product.status])}
              tone={PRODUCT_STATUS_TONE[product.status]}
            />
          </div>
          <p className="mt-1 text-[13px] text-muted">
            {product.category.name}
          </p>
          {product.description ? <p className="mt-2 text-sm text-ink">{product.description}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> {t('common.edit')}
          </Button>
          <Button
            variant={product.status === 'ACTIVE' ? 'danger' : 'primary'}
            onClick={() => setArchiveOpen(true)}
          >
            {product.status === 'ACTIVE' ? t('products.toArchive') : t('products.fromArchive')}
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard label={t('field.incoming')} value={product.stats.totalReceived} />
        <MetricCard label={t('field.outgoing')} value={product.stats.totalSold} />
        <MetricCard label={t('field.current')} value={product.stats.currentTotalStock} active />
        <MetricCard label={t('chart.revenue')} value={formatMoney(product.stats.totalRevenue)} />
        <MetricCard label={t('products.profit')} value={formatMoney(product.stats.totalProfit)} />
      </div>

      <Card className="p-5">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="variants">{t('products.tabVariants')}</TabsTrigger>
            <TabsTrigger value="history">{t('products.tabHistory')}</TabsTrigger>
            <TabsTrigger value="images">{t('products.tabImages')}</TabsTrigger>
          </TabsList>
          <TabsContent value="variants">
            <VariantsTable
              productId={product.id}
              variants={product.variants}
              onSelectHistory={(variantId) => {
                setHistoryVariantId(variantId)
                setTab('history')
              }}
            />
          </TabsContent>
          <TabsContent value="history">
            <VariantHistorySection
              variants={product.variants}
              selectedVariantId={historyVariantId ?? product.variants[0]?.id}
              onSelect={setHistoryVariantId}
            />
          </TabsContent>
          <TabsContent value="images">
            <ImageManager productId={product.id} images={product.images} />
          </TabsContent>
        </Tabs>
      </Card>

      <EditProductDialog product={product} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={
          product.status === 'ACTIVE' ? t('products.archiveTitle') : t('products.unarchiveTitle')
        }
        description={
          product.status === 'ACTIVE' ? t('products.archiveText') : t('products.unarchiveText')
        }
        confirmLabel={product.status === 'ACTIVE' ? t('common.archive') : t('common.restore')}
        onConfirm={async () => {
          try {
            await setProductArchived.mutateAsync({
              id: product.id,
              isArchived: product.status === 'ACTIVE',
            })
            toast.success(
              product.status === 'ACTIVE' ? t('products.archived') : t('products.unarchived'),
            )
          } catch (error) {
            toast.error(apiErrorMessage(error))
          }
        }}
      />
    </div>
  )
}
