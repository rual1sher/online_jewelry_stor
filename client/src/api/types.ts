// Типы отражают модели Prisma (api/prisma/schema.prisma). Строковые union вместо
// TS enum — проект собирается с erasableSyntaxOnly, обычные enum недопустимы.

export type UserRole = 'OWNER' | 'MANAGER'

export type ProductStatus = 'ACTIVE' | 'ARCHIVED'

export type StockMovementType = 'INCOMING' | 'SALE' | 'RETURN' | 'ADJUSTMENT'

export type AdjustmentReason = 'LOST' | 'DAMAGED' | 'MISCOUNTED' | 'OTHER'

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED'

export type DeliveryPayer = 'CUSTOMER' | 'STORE'

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'CLICK'
  | 'PAYME'
  | 'BANK_TRANSFER'
  | 'OTHER'

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface User {
  id: string
  phone: string
  name: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

export interface AuthenticatedUser {
  id: string
  phone: string
  name: string
  role: UserRole
}

export interface Category {
  id: string
  name: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface ExpenseCategory {
  id: string
  name: string
  isArchived: boolean
  createdAt: string
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  sortOrder: number
  createdAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  sellingPrice: number
  averageCost: number
  currentStock: number
  minStock: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
  received?: number
  sold?: number
}

export interface Product {
  id: string
  name: string
  description: string | null
  status: ProductStatus
  categoryId: string
  category: Category
  images: ProductImage[]
  variants: ProductVariant[]
  createdAt: string
  updatedAt: string
}

export interface ProductListItem {
  id: string
  name: string
  status: ProductStatus
  category: Category
  image: string | null
  variantsCount: number
  totalReceived: number
  totalSold: number
  totalStock: number
  costPriceFrom?: number
  sellingPriceFrom: number
}

export interface ProductDetail extends Product {
  stats: {
    totalReceived: number
    totalSold: number
    currentTotalStock: number
    totalStockValue?: number
    totalRevenue: number
    totalProfit: number
  }
}

export interface StockMovement {
  id: string
  variantId: string
  type: StockMovementType
  quantityChange: number
  stockAfter: number
  costAtMovement: number
  stockReceiptId: string | null
  orderId: string | null
  adjustmentReason: AdjustmentReason | null
  comment: string | null
  createdAt: string
  variant?: ProductVariant & { product: Product }
}

export interface StockTableItem {
  variantId: string
  productName: string
  variantName: string
  currentStock: number
  averageCost: number
  stockValue: number
  minStock: number
  status: 'SUFFICIENT' | 'LOW' | 'OUT'
}

export interface StockTable {
  summary: {
    totalVariants: number
    totalUnits: number
    totalStockValue: number
    lowStockCount: number
  }
  items: StockTableItem[]
}

export interface LowStockItem {
  variantId: string
  productName: string
  variantName: string
  image: string | null
  currentStock: number
  minStock: number
}

export interface OrderItem {
  id: string
  orderId: string
  variantId: string
  variant: ProductVariant & { product: Product }
  quantity: number
  priceAtSale: number
  costAtSale: number
  createdAt: string
}

export interface Payment {
  id: string
  orderId: string
  amount: number
  method: PaymentMethod
  paidAt: string
  comment: string | null
  createdAt: string
}

export interface OrderStatusHistoryEntry {
  id: string
  orderId: string
  status: OrderStatus
  changedAt: string
  comment: string | null
}

export interface OrderListItem {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  itemsAmount: number
  deliveryPrice: number
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  createdAt: string
  itemsCount: number
}

export interface OrderDetail {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  deliveryPrice: number
  deliveryPaidBy: DeliveryPayer
  comment: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  payments: Payment[]
  statusHistory: OrderStatusHistoryEntry[]
  financials: {
    revenue: number
    cogs: number
    grossProfit: number
    storeDeliveryCost: number
    netProfit: number
    totalAmount: number
    paidAmount: number
    remainingAmount: number
  }
}

export interface Expense {
  id: string
  categoryId: string
  category: ExpenseCategory
  title: string
  amount: number
  date: string
  comment: string | null
  receiptPhotoUrl: string | null
  createdAt: string
}

export interface StoreSettings {
  id: string
  storeName: string
  logoUrl: string | null
  currency: string
  defaultMinStock: number
  updatedAt: string
}

export interface DashboardOverview {
  revenue: number
  netProfit: number
  ordersCount: number
  stockValue: number
  recentOrders: {
    id: string
    orderNumber: string
    itemsCount: number
    totalAmount: number
    status: OrderStatus
    paymentStatus: PaymentStatus
    createdAt: string
  }[]
  lowStockItems: LowStockItem[]
  chartData: { date: string; revenue: number; profit: number }[]
}

export interface FinancialSummary {
  revenue: number
  cogs: number
  grossProfit: number
  totalExpenses: number
  storeDeliveryCost: number
  netProfit: number
}

export interface TopProduct {
  variantId: string
  productName: string
  variantName: string
  quantitySold: number
  revenue: number
  cogs: number
  profit: number
}
