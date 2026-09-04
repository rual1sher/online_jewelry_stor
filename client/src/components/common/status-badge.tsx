import { Badge } from '@/components/ui/badge'
import type { SemanticTone } from '@/lib/constants'

interface StatusBadgeProps {
  label: string
  tone: SemanticTone
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <Badge tone={tone}>{label}</Badge>
}
