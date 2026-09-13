import { Injectable } from '@nestjs/common';
import { DeliveryPayer, OrderStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { InventoryService } from '../inventory/inventory.service';

const RECENT_ORDERS_LIMIT = 10;

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService,
    private readonly inventoryService: InventoryService,
  ) {}

  async getOverview(from: Date, to: Date) {
    const [
      summary,
      chartData,
      stockValue,
      lowStockItems,
      recentOrders,
      ordersCount,
    ] = await Promise.all([
      this.analyticsService.getFinancialSummary(from, to),
      this.analyticsService.getDailySeries(from, to),
      this.inventoryService.getTotalStockValue(),
      this.inventoryService.findLowStock(),
      this.getRecentOrders(),
      this.prisma.order.count({
        where: {
          createdAt: { gte: from, lte: to },
          status: { not: OrderStatus.CANCELLED },
        },
      }),
    ]);

    return {
      revenue: summary.revenue,
      netProfit: summary.netProfit,
      ordersCount,
      stockValue,
      recentOrders,
      lowStockItems,
      chartData,
    };
  }

  private async getRecentOrders() {
    const orders = await this.prisma.order.findMany({
      take: RECENT_ORDERS_LIMIT,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    return orders.map((order) => {
      const firstItem = order.items[0];
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        itemsCount: order.items.length,
        productName: firstItem?.variant?.product?.name ?? null,
        variantName: firstItem?.variant?.name ?? null,
        productImage: firstItem?.variant?.product?.images?.[0]?.url ?? null,
        totalAmount:
          order.items.reduce((sum, i) => sum + i.quantity * i.priceAtSale, 0) +
          (order.deliveryPaidBy === DeliveryPayer.CUSTOMER ? order.deliveryPrice : 0) +
          (order.packagingPrice || 0),
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      };
    });
  }
}
