import { format, formatDistanceToNow } from 'date-fns'
import { ru, uz } from 'date-fns/locale'
import { t } from '@/lib/i18n'
import { useLocaleStore } from '@/store/locale'

/** Форматтеры вне React читают язык из стора: смена языка перерисовывает всё дерево
 *  (см. key на <Routes> в App.tsx), поэтому подписка здесь не нужна. */
function dateLocale() {
  return useLocaleStore.getState().lang === 'uz' ? uz : ru
}

function numberFormatter() {
  return new Intl.NumberFormat(useLocaleStore.getState().lang === 'uz' ? 'uz-UZ' : 'ru-RU')
}

/** Суммы в системе хранятся целыми числами сумов — без плавающей точки. */
export function formatMoney(amount: number, currency = t('common.currency')): string {
  return `${numberFormatter().format(amount)} ${currency}`
}

export function formatNumber(value: number): string {
  return numberFormatter().format(value)
}

export function formatDate(value: string | Date): string {
  return format(new Date(value), 'd MMM yyyy', { locale: dateLocale() })
}

export function formatDateTime(value: string | Date): string {
  return format(new Date(value), 'd MMM yyyy, HH:mm', { locale: dateLocale() })
}

export function formatChartDate(value: string | Date): string {
  return format(new Date(value), 'd MMM', { locale: dateLocale() })
}

export function formatChartDateFull(value: string | Date): string {
  return format(new Date(value), 'd MMMM yyyy', { locale: dateLocale() })
}

export function formatRelative(value: string | Date): string {
  return formatDistanceToNow(new Date(value), { locale: dateLocale(), addSuffix: true })
}

export function toInputDate(value: string | Date): string {
  return format(new Date(value), 'yyyy-MM-dd')
}
