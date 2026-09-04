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
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_TONE } from '@/lib/constants'
import { formatMoney } from '@/lib/format'
import { EditProductDialog } from './components/edit-product-dialog'
import { ImageManager } from './components/image-manager'
import { VariantHistorySection } from './components/variant-history-section'
import { VariantsTable } from './components/variants-table'

export function ProductDetailPage() {
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
      <title>{`${product.name} — Ювелир`}</title>
      <Link to="/products" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Назад к товарам
      </Link>

      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 md:flex-row">
        <div className="size-24 shrink-0 overflow-hidden rounded-md bg-canvas">
          {cover ? <img src={cover} alt="" className="size-full object-cover" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-[24px] font-semibold text-ink">{product.name}</h1>
            <StatusBadge
              label={PRODUCT_STATUS_LABELS[product.status]}
              tone={PRODUCT_STATUS_TONE[product.status]}
            />
          </div>
          <p className="mt-1 text-[13px] text-muted">
            {product.category.name} · SKU {product.sku}
          </p>
          {product.description ? <p className="mt-2 text-sm text-ink">{product.description}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Редактировать
          </Button>
          <Button
            variant={product.status === 'ACTIVE' ? 'danger' : 'primary'}
            onClick={() => setArchiveOpen(true)}
          >
            {product.status === 'ACTIVE' ? 'В архив' : 'Из архива'}
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard label="Текущий остаток" value={product.stats.currentTotalStock} />
        <MetricCard label="Стоимость на складе" value={formatMoney(product.stats.totalStockValue)} />
        <MetricCard label="Продано всего" value={product.stats.totalSold} />
        <MetricCard label="Выручка" value={formatMoney(product.stats.totalRevenue)} />
        <MetricCard label="Прибыль" value={formatMoney(product.stats.totalProfit)} />
      </div>

      <Card className="p-5">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="variants">Варианты</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
            <TabsTrigger value="images">Изображения</TabsTrigger>
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
        title={product.status === 'ACTIVE' ? 'Архивировать товар?' : 'Вернуть товар из архива?'}
        description={
          product.status === 'ACTIVE'
            ? 'Товар пропадёт из активного списка, но останется в истории заказов.'
            : 'Товар снова появится в общем списке товаров.'
        }
        confirmLabel={product.status === 'ACTIVE' ? 'Архивировать' : 'Вернуть'}
        onConfirm={async () => {
          try {
            await setProductArchived.mutateAsync({
              id: product.id,
              isArchived: product.status === 'ACTIVE',
            })
            toast.success(product.status === 'ACTIVE' ? 'Товар архивирован' : 'Товар возвращён из архива')
          } catch (error) {
            toast.error(apiErrorMessage(error))
          }
        }}
      />
    </div>
  )
}
