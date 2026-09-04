import type {
  AdjustmentReason,
  DeliveryPayer,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
  StockMovementType,
  UserRole,
} from '@/api/types'

export type SemanticTone = 'success' | 'warning' | 'danger' | 'neutral'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Новый',
  CONFIRMED: 'Подтверждён',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
}

export const ORDER_STATUS_TONE: Record<OrderStatus, SemanticTone> = {
  NEW: 'neutral',
  CONFIRMED: 'neutral',
  SHIPPED: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'danger',
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'NEW',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: 'Не оплачено',
  PARTIALLY_PAID: 'Частично оплачено',
  PAID: 'Оплачено',
  REFUNDED: 'Возвращено',
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, SemanticTone> = {
  UNPAID: 'danger',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  REFUNDED: 'neutral',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Наличные',
  CARD: 'Карта',
  CLICK: 'Click',
  PAYME: 'Payme',
  BANK_TRANSFER: 'Банковский перевод',
  OTHER: 'Другое',
}

export const DELIVERY_PAYER_LABELS: Record<DeliveryPayer, string> = {
  CUSTOMER: 'Клиент',
  STORE: 'Магазин',
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: 'Активен',
  ARCHIVED: 'В архиве',
}

export const PRODUCT_STATUS_TONE: Record<ProductStatus, SemanticTone> = {
  ACTIVE: 'success',
  ARCHIVED: 'neutral',
}

export const STOCK_STATUS_LABELS: Record<
  'SUFFICIENT' | 'LOW' | 'OUT',
  string
> = {
  SUFFICIENT: 'Достаточно',
  LOW: 'Мало осталось',
  OUT: 'Закончился',
}

export const STOCK_STATUS_TONE: Record<
  'SUFFICIENT' | 'LOW' | 'OUT',
  SemanticTone
> = {
  SUFFICIENT: 'success',
  LOW: 'warning',
  OUT: 'danger',
}

export const STOCK_MOVEMENT_LABELS: Record<StockMovementType, string> = {
  INCOMING: 'Приход',
  SALE: 'Продажа',
  RETURN: 'Возврат',
  ADJUSTMENT: 'Корректировка',
}

export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  LOST: 'Утеряно',
  DAMAGED: 'Повреждено',
  MISCOUNTED: 'Ошибочно учтено',
  OTHER: 'Другое',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Владелец',
  MANAGER: 'Менеджер',
}

export const EXPENSE_CATEGORY_PRESETS = [
  'Реклама',
  'Контент',
  'Фото/видео',
  'Аренда',
  'Программы (подписки)',
  'Прочие расходы',
]

export const DATE_PRESETS = [
  { key: 'today', label: 'Сегодня' },
  { key: 'yesterday', label: 'Вчера' },
  { key: 'last7', label: 'Последние 7 дней' },
  { key: 'last30', label: 'Последние 30 дней' },
  { key: 'thisMonth', label: 'Этот месяц' },
  { key: 'lastMonth', label: 'Прошлый месяц' },
  { key: 'custom', label: 'Свой диапазон' },
] as const

export type DatePresetKey = (typeof DATE_PRESETS)[number]['key']
