interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return <div className="py-10 text-center text-sm text-muted">{message}</div>
}
