import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

const numberFormatter = new Intl.NumberFormat('ru-RU')

/** Суммы в системе хранятся целыми числами сумов — без плавающей точки. */
export function formatMoney(amount: number, currency = 'сум'): string {
  return `${numberFormatter.format(amount)} ${currency}`
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatDate(value: string | Date): string {
  return format(new Date(value), 'd MMM yyyy', { locale: ru })
}

export function formatDateTime(value: string | Date): string {
  return format(new Date(value), 'd MMM yyyy, HH:mm', { locale: ru })
}

export function formatRelative(value: string | Date): string {
  return formatDistanceToNow(new Date(value), { locale: ru, addSuffix: true })
}

export function toInputDate(value: string | Date): string {
  return format(new Date(value), 'yyyy-MM-dd')
}
