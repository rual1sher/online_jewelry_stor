import { Injectable } from '@nestjs/common';
import { DeliveryPayer, OrderStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface DeliveredOrderSnapshot {
  orderId: string;
  deliveredAt: Date;
  deliveryPrice: number;
  deliveryPaidBy: DeliveryPayer;
  packagingPrice: number;
  items: {
    variantId: string;
    productName: string;
    variantName: string;
    quantity: number;
    priceAtSale: number;
    costAtSale: number;
  }[];
}

export interface FinancialSummary {
  revenue: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  storeDeliveryCost: number;
  netProfit: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // Заказ считается "доставленным за период", если переход в DELIVERED произошёл внутри диапазона дат.
  async getDeliveredOrdersInRange(
    from: Date,
    to: Date,
  ): Promise<DeliveredOrderSnapshot[]> {
    const histories = await this.prisma.orderStatusHistory.findMany({
      where: {
        status: OrderStatus.DELIVERED,
        changedAt: { gte: from, lte: to },
      },
      include: {
        order: {
          include: {
            items: { include: { variant: { include: { product: true } } } },
          },
        },
      },
    });

    return histories.map((h) => ({
      orderId: h.orderId,
      deliveredAt: h.changedAt,
      deliveryPrice: h.order.deliveryPrice,
      deliveryPaidBy: h.order.deliveryPaidBy,
      packagingPrice: h.order.packagingPrice ?? 0,
      items: h.order.items.map((item) => ({
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantName: item.variant.name,
        quantity: item.quantity,
        priceAtSale: item.priceAtSale,
        costAtSale: item.costAtSale,
      })),
    }));
  }

  async getFinancialSummary(from: Date, to: Date): Promise<FinancialSummary> {
    const delivered = await this.getDeliveredOrdersInRange(from, to);

    const revenue = delivered.reduce(
      (sum, o) =>
        sum +
        o.items.reduce((s, i) => s + i.quantity * i.priceAtSale, 0) +
        (o.packagingPrice || 0),
      0,
    );
    const cogs = delivered.reduce(
      (sum, o) =>
        sum + o.items.reduce((s, i) => s + i.quantity * i.costAtSale, 0),
      0,
    );
    const storeDeliveryCost = delivered
      .filter((o) => o.deliveryPaidBy === DeliveryPayer.STORE)
      .reduce((sum, o) => sum + o.deliveryPrice, 0);

    const totalExpensesAgg = await this.prisma.expense.aggregate({
      where: { date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    const totalExpenses = totalExpensesAgg._sum.amount ?? 0;

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - totalExpenses - storeDeliveryCost;

    return {
      revenue,
      cogs,
      grossProfit,
      totalExpenses,
      storeDeliveryCost,
      netProfit,
    };
  }

  async getDailySeries(
    from: Date,
    to: Date,
  ): Promise<{ date: string; revenue: number; profit: number }[]> {
    const delivered = await this.getDeliveredOrdersInRange(from, to);
    const byDay = new Map<string, { revenue: number; profit: number }>();

    for (const order of delivered) {
      const day = order.deliveredAt.toISOString().slice(0, 10);
      const revenue =
        order.items.reduce(
          (s, i) => s + i.quantity * i.priceAtSale,
          0,
        ) + (order.packagingPrice || 0);
      const cogs = order.items.reduce(
        (s, i) => s + i.quantity * i.costAtSale,
        0,
      );
      const storeDeliveryCost =
        order.deliveryPaidBy === DeliveryPayer.STORE ? order.deliveryPrice : 0;
      const profit = revenue - cogs - storeDeliveryCost;

      const existing = byDay.get(day) ?? { revenue: 0, profit: 0 };
      byDay.set(day, {
        revenue: existing.revenue + revenue,
        profit: existing.profit + profit,
      });
    }

    return Array.from(byDay.entries())
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getDailyExpenseSeries(
    from: Date,
    to: Date,
  ): Promise<{ date: string; amount: number }[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { date: { gte: from, lte: to } },
      select: { date: true, amount: true },
    });

    const byDay = new Map<string, number>();
    for (const expense of expenses) {
      const day = expense.date.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + expense.amount);
    }

    return Array.from(byDay.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopProducts(
    from: Date,
    to: Date,
    limit: number,
    sortBy: 'quantity' | 'profit' = 'quantity',
  ): Promise<
    {
      variantId: string;
      productName: string;
      variantName: string;
      quantitySold: number;
      revenue: number;
      cogs: number;
      profit: number;
    }[]
  > {
    const delivered = await this.getDeliveredOrdersInRange(from, to);
    const byVariant = new Map<
      string,
      {
        productName: string;
        variantName: string;
        quantitySold: number;
        revenue: number;
        cogs: number;
      }
    >();

    for (const order of delivered) {
      for (const item of order.items) {
        const existing = byVariant.get(item.variantId) ?? {
          productName: item.productName,
          variantName: item.variantName,
          quantitySold: 0,
          revenue: 0,
          cogs: 0,
        };
        existing.quantitySold += item.quantity;
        existing.revenue += item.quantity * item.priceAtSale;
        existing.cogs += item.quantity * item.costAtSale;
        byVariant.set(item.variantId, existing);
      }
    }

    const all = Array.from(byVariant.entries()).map(([variantId, v]) => ({
      variantId,
      ...v,
      profit: v.revenue - v.cogs,
    }));

    const sorted =
      sortBy === 'profit'
        ? all.sort((a, b) => b.profit - a.profit)
        : all.sort((a, b) => b.quantitySold - a.quantitySold);

    return sorted.slice(0, limit);
  }
}
