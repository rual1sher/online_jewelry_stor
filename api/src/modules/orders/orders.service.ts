import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { paginationSkip, toPaginated } from '../../common/pagination.util';
import {
  DeliveryPayer,
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { AddPaymentDto } from './dto/add-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

const STOCK_DEDUCTED_STATUSES: OrderStatus[] = [
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

// Состав заказа и доставку можно менять, только пока товар ещё не списан со склада.
const EDITABLE_STATUSES: OrderStatus[] = [
  OrderStatus.NEW,
  OrderStatus.CONFIRMED,
];

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const variantIds = dto.items.map((i) => i.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
      });
      if (variants.length !== new Set(variantIds).size) {
        throw new NotFoundException(
          'Один или несколько вариантов товара не найдены',
        );
      }
      const archived = variants.find((v) => v.isArchived);
      if (archived) {
        throw new BadRequestException(
          `Вариант товара «${archived.name}» в архиве — недоступен для продажи`,
        );
      }
      const variantById = new Map(variants.map((v) => [v.id, v]));

      let packagingPrice = 0;
      if (dto.packagingId) {
        const packaging = await tx.packaging.findUnique({
          where: { id: dto.packagingId },
        });
        if (!packaging) {
          throw new NotFoundException('Упаковка не найдена');
        }
        packagingPrice = dto.packagingPrice ?? packaging.price;
      }

      const orderNumber = await this.generateOrderNumber(tx);

      const order = await tx.order.create({
        data: {
          orderNumber,
          packagingId: dto.packagingId ?? null,
          packagingPrice,
          deliveryPrice: dto.deliveryPrice ?? 0,
          deliveryPaidBy: dto.deliveryPaidBy ?? DeliveryPayer.CUSTOMER,
          comment: dto.comment,
          items: {
            create: dto.items.map((item) => {
              const variant = variantById.get(item.variantId);
              if (!variant) {
                throw new NotFoundException('Вариант товара не найден');
              }
              return {
                variantId: item.variantId,
                quantity: item.quantity,
                priceAtSale: item.priceAtSale ?? variant.sellingPrice,
                costAtSale: variant.averageCost,
              };
            }),
          },
          statusHistory: { create: { status: OrderStatus.NEW } },
        },
        include: {
          items: { include: { variant: { include: { product: true } } } },
          packaging: true,
          statusHistory: true,
        },
      });

      return order;
    });
  }

  // Редактирование состава/доставки заказа — доступно, только пока товар не списан со склада
  // (статусы NEW/CONFIRMED). После SHIPPED заказ неизменен, кроме смены статуса и оплат.
  async update(id: string, dto: UpdateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) {
        throw new NotFoundException('Заказ не найден');
      }
      if (!EDITABLE_STATUSES.includes(order.status)) {
        throw new BadRequestException(
          `Нельзя изменить состав заказа в статусе ${order.status} — товар уже списан со склада`,
        );
      }

      if (dto.items) {
        const variantIds = dto.items.map((i) => i.variantId);
        const variants = await tx.productVariant.findMany({
          where: { id: { in: variantIds } },
        });
        if (variants.length !== new Set(variantIds).size) {
          throw new NotFoundException(
            'Один или несколько вариантов товара не найдены',
          );
        }
        const archived = variants.find((v) => v.isArchived);
        if (archived) {
          throw new BadRequestException(
            `Вариант товара «${archived.name}» в архиве — недоступен для продажи`,
          );
        }
        const variantById = new Map(variants.map((v) => [v.id, v]));

        await tx.orderItem.deleteMany({ where: { orderId: id } });
        await tx.orderItem.createMany({
          data: dto.items.map((item) => {
            const variant = variantById.get(item.variantId);
            if (!variant) {
              throw new NotFoundException('Вариант товара не найден');
            }
            return {
              orderId: id,
              variantId: item.variantId,
              quantity: item.quantity,
              priceAtSale: item.priceAtSale ?? variant.sellingPrice,
              costAtSale: variant.averageCost,
            };
          }),
        });
      }

      let packagingId = order.packagingId;
      let packagingPrice = order.packagingPrice;
      if (dto.packagingId !== undefined) {
        if (!dto.packagingId) {
          packagingId = null;
          packagingPrice = 0;
        } else {
          const packaging = await tx.packaging.findUnique({
            where: { id: dto.packagingId },
          });
          if (!packaging) {
            throw new NotFoundException('Упаковка не найдена');
          }
          packagingId = dto.packagingId;
          packagingPrice = dto.packagingPrice ?? packaging.price;
        }
      } else if (dto.packagingPrice !== undefined) {
        packagingPrice = dto.packagingPrice;
      }

      return tx.order.update({
        where: { id },
        data: {
          packagingId,
          packagingPrice,
          deliveryPrice: dto.deliveryPrice,
          deliveryPaidBy: dto.deliveryPaidBy,
          comment: dto.comment,
        },
        include: {
          items: { include: { variant: { include: { product: true } } } },
          packaging: true,
          payments: { orderBy: { paidAt: 'desc' } },
          statusHistory: { orderBy: { changedAt: 'asc' } },
        },
      });
    });
  }

  async findAll(query: QueryOrdersDto) {
    const { skip, take } = paginationSkip(query.page, query.limit);
    const where: Prisma.OrderWhereInput = {
      status: query.status,
      paymentStatus: query.paymentStatus,
      createdAt:
        query.from || query.to
          ? {
              gte: query.from ? new Date(query.from) : undefined,
              lte: query.to ? new Date(query.to) : undefined,
            }
          : undefined,
      ...(query.search
        ? { orderNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { items: true, payments: true, packaging: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    const items = orders.map((order) => this.toSummary(order));
    return toPaginated(items, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        packaging: true,
        payments: { orderBy: { paidAt: 'desc' } },
        statusHistory: { orderBy: { changedAt: 'asc' } },
      },
    });
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    return { ...order, financials: this.computeFinancials(order) };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) {
        throw new NotFoundException('Заказ не найден');
      }

      if (dto.status === order.status) {
        throw new BadRequestException('Заказ уже находится в этом статусе');
      }
      if (!ALLOWED_TRANSITIONS[order.status].includes(dto.status)) {
        throw new BadRequestException(
          `Недопустимый переход статуса: ${order.status} → ${dto.status}`,
        );
      }

      const wasStockDeducted = STOCK_DEDUCTED_STATUSES.includes(order.status);
      const willStockBeDeducted = STOCK_DEDUCTED_STATUSES.includes(dto.status);

      if (!wasStockDeducted && willStockBeDeducted) {
        for (const item of order.items) {
          const costAtSale = await this.inventoryService.deductStock(
            tx,
            item.variantId,
            item.quantity,
          );
          await tx.orderItem.update({
            where: { id: item.id },
            data: { costAtSale },
          });
        }
      }

      if (wasStockDeducted && dto.status === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await this.inventoryService.returnStock(
            tx,
            item.variantId,
            item.quantity,
          );
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: dto.status,
          statusHistory: {
            create: { status: dto.status, comment: dto.comment },
          },
        },
        include: {
          items: true,
          payments: true,
          statusHistory: { orderBy: { changedAt: 'asc' } },
        },
      });

      return updated;
    });
  }

  async addPayment(orderId: string, dto: AddPaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, payments: true },
      });
      if (!order) {
        throw new NotFoundException('Заказ не найден');
      }
      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException(
          'Нельзя добавить оплату к отменённому заказу',
        );
      }

      await tx.payment.create({
        data: {
          orderId,
          amount: dto.amount,
          method: dto.method,
          comment: dto.comment,
        },
      });

      const totalAmount =
        this.itemsAmount(order.items) +
        order.deliveryPrice +
        order.packagingPrice;
      const paidAmount =
        order.payments.reduce((sum, p) => sum + p.amount, 0) + dto.amount;

      const paymentStatus = this.derivePaymentStatus(paidAmount, totalAmount);

      return tx.order.update({
        where: { id: orderId },
        data: { paymentStatus },
        include: { payments: { orderBy: { paidAt: 'desc' } } },
      });
    });
  }

  // Возврат части или всей уплаченной суммы. Хранится как платёж с отрицательной
  // суммой — так paidAmount и paymentStatus остаются производными от истории платежей,
  // а не от ручного флага, и сумма возврата остаётся в истории оплат заказа.
  async refundPayment(orderId: string, dto: RefundPaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, payments: true },
      });
      if (!order) {
        throw new NotFoundException('Заказ не найден');
      }

      const paidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0);
      if (dto.amount > paidAmount) {
        throw new BadRequestException(
          `Сумма возврата (${dto.amount}) больше уплаченной суммы (${paidAmount})`,
        );
      }

      await tx.payment.create({
        data: {
          orderId,
          amount: -dto.amount,
          method: dto.method,
          comment: dto.comment,
        },
      });

      const totalAmount =
        this.itemsAmount(order.items) +
        order.deliveryPrice +
        order.packagingPrice;
      const remainingPaid = paidAmount - dto.amount;
      const paymentStatus =
        remainingPaid <= 0
          ? PaymentStatus.REFUNDED
          : this.derivePaymentStatus(remainingPaid, totalAmount);

      return tx.order.update({
        where: { id: orderId },
        data: { paymentStatus },
        include: { payments: { orderBy: { paidAt: 'desc' } } },
      });
    });
  }

  async setPaymentStatus(orderId: string, dto: UpdatePaymentStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: dto.paymentStatus },
    });
  }

  private derivePaymentStatus(
    paidAmount: number,
    totalAmount: number,
  ): PaymentStatus {
    if (paidAmount >= totalAmount) return PaymentStatus.PAID;
    if (paidAmount > 0) return PaymentStatus.PARTIALLY_PAID;
    return PaymentStatus.UNPAID;
  }

  private async generateOrderNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const result = await tx.$queryRaw<
      { nextval: bigint }[]
    >`SELECT nextval('order_number_seq')`;
    const sequenceValue = result[0].nextval.toString().padStart(6, '0');
    return `ORD-${sequenceValue}`;
  }

  private itemsAmount(
    items: { quantity: number; priceAtSale: number }[],
  ): number {
    return items.reduce((sum, i) => sum + i.quantity * i.priceAtSale, 0);
  }

  private toSummary(order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    deliveryPrice: number;
    packagingPrice: number;
    packagingId?: string | null;
    packaging?: { id: string; name: string; price: number } | null;
    createdAt: Date;
    items: { quantity: number; priceAtSale: number }[];
    payments: { amount: number }[];
  }) {
    const itemsAmount = this.itemsAmount(order.items);
    const packagingPrice = order.packagingPrice ?? 0;
    const totalAmount = itemsAmount + order.deliveryPrice + packagingPrice;
    const paidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0);
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      itemsAmount,
      packagingPrice,
      packagingId: order.packagingId,
      packaging: order.packaging,
      deliveryPrice: order.deliveryPrice,
      totalAmount,
      paidAmount,
      remainingAmount: totalAmount - paidAmount,
      createdAt: order.createdAt,
      itemsCount: order.items.length,
    };
  }

  private computeFinancials(order: {
    deliveryPrice: number;
    deliveryPaidBy: DeliveryPayer;
    packagingPrice: number;
    items: { quantity: number; priceAtSale: number; costAtSale: number }[];
    payments: { amount: number }[];
  }) {
    const packagingPrice = order.packagingPrice ?? 0;
    const itemsAmount = this.itemsAmount(order.items);
    const revenue = itemsAmount + packagingPrice;
    const cogs = order.items.reduce(
      (sum, i) => sum + i.quantity * i.costAtSale,
      0,
    );
    const grossProfit = revenue - cogs;
    const storeDeliveryCost =
      order.deliveryPaidBy === DeliveryPayer.STORE ? order.deliveryPrice : 0;
    const netProfit = grossProfit - storeDeliveryCost;
    const totalAmount = revenue + order.deliveryPrice;
    const paidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0);
    return {
      itemsAmount,
      packagingPrice,
      revenue,
      cogs,
      grossProfit,
      storeDeliveryCost,
      netProfit,
      totalAmount,
      paidAmount,
      remainingAmount: totalAmount - paidAmount,
    };
  }
}
