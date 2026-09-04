import { create } from 'zustand'
import type { DatePresetKey } from '@/lib/constants'
import { resolvePresetRange, toIsoRange } from '@/lib/dateRange'

// Единый источник периода для всех виджетов дашборда — меняется в одном месте
// (шапка страницы), а все карточки/графики/таблицы подписываются на этот стор.
interface DashboardDateFilterState {
  preset: DatePresetKey
  customFrom: string | null
  customTo: string | null
  setPreset: (preset: DatePresetKey) => void
  setCustomRange: (from: string, to: string) => void
}

export const useDashboardDateFilter = create<DashboardDateFilterState>((set) => ({
  preset: 'last30',
  customFrom: null,
  customTo: null,
  setPreset: (preset) => set({ preset }),
  setCustomRange: (customFrom, customTo) =>
    set({ preset: 'custom', customFrom, customTo }),
}))

export function useDashboardIsoRange(): { from: string; to: string } {
  const { preset, customFrom, customTo } = useDashboardDateFilter()
  if (preset === 'custom' && customFrom && customTo) {
    return { from: new Date(customFrom).toISOString(), to: new Date(customTo).toISOString() }
  }
  return toIsoRange(resolvePresetRange(preset))
}
