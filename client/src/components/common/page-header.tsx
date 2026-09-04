import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[32px] font-semibold text-ink">{title}</h1>
        {actions}
      </div>
      <hr className="bevel-divider mt-3 w-32" />
      {description ? <p className="mt-3 text-sm text-muted">{description}</p> : null}
    </div>
  )
}
