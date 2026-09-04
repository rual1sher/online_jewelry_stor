import { Injectable } from '@nestjs/common';
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
      this.prisma.order.count({ where: { createdAt: { gte: from, lte: to } } }),
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
      include: { items: true },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      itemsCount: order.items.length,
      totalAmount:
        order.items.reduce((sum, i) => sum + i.quantity * i.priceAtSale, 0) +
        order.deliveryPrice,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
    }));
  }
}
