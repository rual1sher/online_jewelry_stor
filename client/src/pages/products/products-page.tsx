import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProducts } from '@/api/products'
import type { ProductStatus } from '@/api/types'
import { EmptyState } from '@/components/common/empty-state'
import { Loading } from '@/components/common/loading'
import { MoneyText } from '@/components/common/money-text'
import { PageHeader } from '@/components/common/page-header'
import { Pagination } from '@/components/common/pagination'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_TONE } from '@/lib/constants'
import { ProductFilters } from './components/product-filters'
import { ProductFormDialog } from './components/product-form-dialog'

const LIMIT = 20

export function ProductsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [status, setStatus] = useState<ProductStatus | undefined>()
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading } = useProducts({
    page,
    limit: LIMIT,
    search: search || undefined,
    categoryId,
    status,
  })

  return (
    <div>
      <title>Товары — Ювелир</title>
      <PageHeader
        title="Товары"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Добавить товар
          </Button>
        }
      />

      <div className="mb-4">
        <ProductFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          categoryId={categoryId}
          onCategoryChange={(v) => {
            setCategoryId(v)
            setPage(1)
          }}
          status={status}
          onStatusChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        />
      </div>

      <Card className="overflow-hidden">
        {isLoading || !data ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <EmptyState message="Товаров пока нет — добавьте первый товар, чтобы начать" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>Название</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Варианты</TableHead>
                  <TableHead>Остаток</TableHead>
                  <TableHead>Цена от</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <TableCell>
                      <div className="size-10 overflow-hidden rounded bg-canvas">
                        {product.image ? (
                          <img src={product.image} alt="" className="size-full object-cover" />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted">{product.category.name}</TableCell>
                    <TableCell className="text-muted">{product.sku}</TableCell>
                    <TableCell>{product.variantsCount}</TableCell>
                    <TableCell className="tabular-nums">{product.totalStock}</TableCell>
                    <TableCell>
                      <MoneyText amount={product.sellingPriceFrom} className="text-[13px]" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={PRODUCT_STATUS_LABELS[product.status]}
                        tone={PRODUCT_STATUS_TONE[product.status]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} limit={LIMIT} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <ProductFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
