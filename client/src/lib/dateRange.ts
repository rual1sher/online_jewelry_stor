import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns'
import { useMemo, useState } from 'react'
import type { DatePresetKey } from './constants'

export interface DateRange {
  from: Date
  to: Date
}

export function resolvePresetRange(key: DatePresetKey): DateRange {
  const now = new Date()
  switch (key) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) }
    case 'yesterday': {
      const yesterday = subDays(now, 1)
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) }
    }
    case 'last7':
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
    case 'last30':
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
    case 'thisMonth':
      return { from: startOfMonth(now), to: endOfDay(now) }
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1)
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
    }
    case 'custom':
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
  }
}

export function toIsoRange(range: DateRange): { from: string; to: string } {
  return { from: range.from.toISOString(), to: range.to.toISOString() }
}

/** Локальный (не глобальный) фильтр периода — для страниц Финансы/Отчёты, у которых
 * свой независимый период, в отличие от общего для дашборда стора. */
export function useLocalDateRange(initialPreset: DatePresetKey = 'last30') {
  const [preset, setPreset] = useState<DatePresetKey>(initialPreset)
  const [customFrom, setCustomFrom] = useState<string | null>(null)
  const [customTo, setCustomTo] = useState<string | null>(null)

  const setCustomRange = (from: string, to: string) => {
    setPreset('custom')
    setCustomFrom(from)
    setCustomTo(to)
  }

  const iso = useMemo(() => {
    if (preset === 'custom' && customFrom && customTo) {
      return { from: new Date(customFrom).toISOString(), to: new Date(customTo).toISOString() }
    }
    return toIsoRange(resolvePresetRange(preset))
  }, [preset, customFrom, customTo])

  return { preset, setPreset, customFrom, customTo, setCustomRange, iso }
}
