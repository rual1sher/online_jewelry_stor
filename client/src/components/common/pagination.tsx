import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import { totalPages } from '@/lib/utils'

interface PaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const t = useT()
  const pages = totalPages(total, limit)
  if (pages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-line px-3 py-3">
      <span className="text-[13px] text-muted">
        {t('common.pagination', { page, pages, total })}
      </span>
      <div className="flex gap-1">
        <Button
          variant="secondary"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
