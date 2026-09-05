import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { DATE_PRESETS, type DatePresetKey } from '@/lib/constants'
import { toInputDate } from '@/lib/format'
import { useT } from '@/lib/i18n'

interface DateRangeFilterProps {
  preset: DatePresetKey
  customFrom: string | null
  customTo: string | null
  onPresetChange: (preset: DatePresetKey) => void
  onCustomRangeChange: (from: string, to: string) => void
}

export function DateRangeFilter({
  preset,
  customFrom,
  customTo,
  onPresetChange,
  onCustomRangeChange,
}: DateRangeFilterProps) {
  const t = useT()
  const today = toInputDate(new Date())

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={preset} onValueChange={(value) => onPresetChange(value as DatePresetKey)}>
        <SelectTrigger className="w-[190px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESETS.map((p) => (
            <SelectItem key={p.key} value={p.key}>
              {t(p.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {preset === 'custom' ? (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-[150px]"
            max={today}
            value={customFrom ?? ''}
            onChange={(e) => onCustomRangeChange(e.target.value, customTo ?? e.target.value)}
          />
          <span className="text-muted">—</span>
          <Input
            type="date"
            className="w-[150px]"
            max={today}
            value={customTo ?? ''}
            onChange={(e) => onCustomRangeChange(customFrom ?? e.target.value, e.target.value)}
          />
        </div>
      ) : null}
    </div>
  )
}
