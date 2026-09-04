import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Loading({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-10 text-muted', className)}>
      <Loader2 className="size-5 animate-spin" />
    </div>
  )
}
