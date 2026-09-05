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
import type { TKey } from '@/lib/i18n'

export type SemanticTone = 'success' | 'warning' | 'danger' | 'neutral'

export type StockStatus = 'SUFFICIENT' | 'LOW' | 'OUT'

/** Подписи статусов и справочников живут в словаре i18n — здесь только ключи,
 *  чтобы список значений и их порядок оставались единым источником правды. */
export const ORDER_STATUSES: OrderStatus[] = [
  'NEW',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

export const ORDER_STATUS_KEY: Record<OrderStatus, TKey> = {
  NEW: 'orderStatus.NEW',
  CONFIRMED: 'orderStatus.CONFIRMED',
  SHIPPED: 'orderStatus.SHIPPED',
  DELIVERED: 'orderStatus.DELIVERED',
  CANCELLED: 'orderStatus.CANCELLED',
}

export const ORDER_STATUS_TONE: Record<OrderStatus, SemanticTone> = {
  NEW: 'neutral',
  CONFIRMED: 'neutral',
  SHIPPED: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'danger',
}

export const ORDER_STATUS_FLOW: OrderStatus[] = ['NEW', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

export const PAYMENT_STATUSES: PaymentStatus[] = ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED']

export const PAYMENT_STATUS_KEY: Record<PaymentStatus, TKey> = {
  UNPAID: 'paymentStatus.UNPAID',
  PARTIALLY_PAID: 'paymentStatus.PARTIALLY_PAID',
  PAID: 'paymentStatus.PAID',
  REFUNDED: 'paymentStatus.REFUNDED',
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, SemanticTone> = {
  UNPAID: 'danger',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  REFUNDED: 'neutral',
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  'CASH',
  'CARD',
  'CLICK',
  'PAYME',
  'BANK_TRANSFER',
  'OTHER',
]

export const PAYMENT_METHOD_KEY: Record<PaymentMethod, TKey> = {
  CASH: 'paymentMethod.CASH',
  CARD: 'paymentMethod.CARD',
  CLICK: 'paymentMethod.CLICK',
  PAYME: 'paymentMethod.PAYME',
  BANK_TRANSFER: 'paymentMethod.BANK_TRANSFER',
  OTHER: 'paymentMethod.OTHER',
}

export const DELIVERY_PAYERS: DeliveryPayer[] = ['CUSTOMER', 'STORE']

export const DELIVERY_PAYER_KEY: Record<DeliveryPayer, TKey> = {
  CUSTOMER: 'deliveryPayer.CUSTOMER',
  STORE: 'deliveryPayer.STORE',
}

export const PRODUCT_STATUSES: ProductStatus[] = ['ACTIVE', 'ARCHIVED']

export const PRODUCT_STATUS_KEY: Record<ProductStatus, TKey> = {
  ACTIVE: 'productStatus.ACTIVE',
  ARCHIVED: 'productStatus.ARCHIVED',
}

export const PRODUCT_STATUS_TONE: Record<ProductStatus, SemanticTone> = {
  ACTIVE: 'success',
  ARCHIVED: 'neutral',
}

export const STOCK_STATUS_KEY: Record<StockStatus, TKey> = {
  SUFFICIENT: 'stockStatus.SUFFICIENT',
  LOW: 'stockStatus.LOW',
  OUT: 'stockStatus.OUT',
}

export const STOCK_STATUS_TONE: Record<StockStatus, SemanticTone> = {
  SUFFICIENT: 'success',
  LOW: 'warning',
  OUT: 'danger',
}

export const STOCK_MOVEMENT_TYPES: StockMovementType[] = [
  'INCOMING',
  'SALE',
  'RETURN',
  'ADJUSTMENT',
]

export const STOCK_MOVEMENT_KEY: Record<StockMovementType, TKey> = {
  INCOMING: 'movement.INCOMING',
  SALE: 'movement.SALE',
  RETURN: 'movement.RETURN',
  ADJUSTMENT: 'movement.ADJUSTMENT',
}

export const ADJUSTMENT_REASONS: AdjustmentReason[] = ['LOST', 'DAMAGED', 'MISCOUNTED', 'OTHER']

export const ADJUSTMENT_REASON_KEY: Record<AdjustmentReason, TKey> = {
  LOST: 'adjustmentReason.LOST',
  DAMAGED: 'adjustmentReason.DAMAGED',
  MISCOUNTED: 'adjustmentReason.MISCOUNTED',
  OTHER: 'adjustmentReason.OTHER',
}

export const USER_ROLES: UserRole[] = ['OWNER', 'MANAGER']

export const USER_ROLE_KEY: Record<UserRole, TKey> = {
  OWNER: 'role.OWNER',
  MANAGER: 'role.MANAGER',
}

export const EXPENSE_CATEGORY_PRESET_KEYS: TKey[] = [
  'expensePreset.ads',
  'expensePreset.content',
  'expensePreset.photo',
  'expensePreset.rent',
  'expensePreset.software',
  'expensePreset.other',
]

export const DATE_PRESETS = [
  { key: 'today', labelKey: 'datePreset.today' },
  { key: 'yesterday', labelKey: 'datePreset.yesterday' },
  { key: 'last7', labelKey: 'datePreset.last7' },
  { key: 'last30', labelKey: 'datePreset.last30' },
  { key: 'thisMonth', labelKey: 'datePreset.thisMonth' },
  { key: 'lastMonth', labelKey: 'datePreset.lastMonth' },
  { key: 'custom', labelKey: 'datePreset.custom' },
] as const satisfies readonly { key: string; labelKey: TKey }[]

export type DatePresetKey = (typeof DATE_PRESETS)[number]['key']
