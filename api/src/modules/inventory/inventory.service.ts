import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { paginationSkip, toPaginated } from '../../common/pagination.util';
import {
  Prisma,
  ProductStatus,
  StockMovementType,
} from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { QueryMovementsDto } from './dto/query-movements.dto';

type Tx = Prisma.TransactionClient;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createReceipt(dto: CreateReceiptDto) {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: dto.variantId },
      });
      if (!variant) {
        throw new NotFoundException('Вариант товара не найден');
      }

      const packaging = dto.packagingPrice ?? 0;
      const additional = dto.additionalCosts ?? 0;
      const unitCost =
        dto.purchasePricePerUnit +
        Math.round((packaging + additional) / dto.quantity);

      const newStock = variant.currentStock + dto.quantity;
      const newAverageCost = Math.round(
        (variant.currentStock * variant.averageCost + dto.quantity * unitCost) /
          newStock,
      );

      const receipt = await tx.stockReceipt.create({
        data: {
          variantId: dto.variantId,
          quantity: dto.quantity,
          purchasePricePerUnit: dto.purchasePricePerUnit,
          packagingPrice: packaging,
          additionalCosts: additional,
          unitCost,
          comment: dto.comment,
        },
      });

      await tx.productVariant.update({
        where: { id: dto.variantId },
        data: { currentStock: newStock, averageCost: newAverageCost },
      });

      await tx.stockMovement.create({
        data: {
          variantId: dto.variantId,
          type: StockMovementType.INCOMING,
          quantityChange: dto.quantity,
          stockAfter: newStock,
          costAtMovement: newAverageCost,
          stockReceiptId: receipt.id,
          comment: dto.comment,
        },
      });

      return tx.productVariant.findUnique({ where: { id: dto.variantId } });
    });
  }

  async createAdjustment(dto: CreateAdjustmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: dto.variantId },
      });
      if (!variant) {
        throw new NotFoundException('Вариант товара не найден');
      }

      const diff = dto.actualQuantity - variant.currentStock;
      if (diff === 0) {
        return variant;
      }

      await tx.productVariant.update({
        where: { id: dto.variantId },
        data: { currentStock: dto.actualQuantity },
      });

      await tx.stockMovement.create({
        data: {
          variantId: dto.variantId,
          type: StockMovementType.ADJUSTMENT,
          quantityChange: diff,
          stockAfter: dto.actualQuantity,
          costAtMovement: variant.averageCost,
          adjustmentReason: dto.reason,
          comment: dto.comment,
        },
      });

      return tx.productVariant.findUnique({ where: { id: dto.variantId } });
    });
  }

  // Списание при отправке заказа (SHIPPED). Вызывается изнутри транзакции OrdersService.
  // Возвращает себестоимость варианта на момент списания — снапшот для OrderItem.costAtSale.
  async deductStock(
    tx: Tx,
    variantId: string,
    quantity: number,
  ): Promise<number> {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException('Вариант товара не найден');
    }
    if (variant.currentStock < quantity) {
      throw new BadRequestException(
        `На складе недостаточно товара: «${variant.name}» (осталось ${variant.currentStock})`,
      );
    }

    const stockAfter = variant.currentStock - quantity;
    await tx.productVariant.update({
      where: { id: variantId },
      data: { currentStock: stockAfter },
    });
    await tx.stockMovement.create({
      data: {
        variantId,
        type: StockMovementType.SALE,
        quantityChange: -quantity,
        stockAfter,
        costAtMovement: variant.averageCost,
      },
    });
    return variant.averageCost;
  }

  // Возврат остатка при отмене отправленного/доставленного заказа. Вызывается изнутри транзакции OrdersService.
  async returnStock(
    tx: Tx,
    variantId: string,
    quantity: number,
  ): Promise<void> {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException('Вариант товара не найден');
    }

    const stockAfter = variant.currentStock + quantity;
    await tx.productVariant.update({
      where: { id: variantId },
      data: { currentStock: stockAfter },
    });
    await tx.stockMovement.create({
      data: {
        variantId,
        type: StockMovementType.RETURN,
        quantityChange: quantity,
        stockAfter,
        costAtMovement: variant.averageCost,
      },
    });
  }

  // По умолчанию скрывает архивированные варианты и товары — они не участвуют
  // в оперативном учёте склада, но остаются в истории движений.
  async getStockTable(includeArchived = false) {
    const variants = await this.prisma.productVariant.findMany({
      where: includeArchived
        ? undefined
        : { isArchived: false, product: { status: ProductStatus.ACTIVE } },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const items = variants.map((v) => ({
      variantId: v.id,
      productName: v.product.name,
      variantName: v.name,
      currentStock: v.currentStock,
      averageCost: v.averageCost,
      stockValue: v.currentStock * v.averageCost,
      minStock: v.minStock,
      status: this.stockStatus(v.currentStock, v.minStock),
    }));

    return {
      summary: {
        totalVariants: items.length,
        totalUnits: items.reduce((sum, i) => sum + i.currentStock, 0),
        totalStockValue: items.reduce((sum, i) => sum + i.stockValue, 0),
        lowStockCount: items.filter((i) => i.status !== 'SUFFICIENT').length,
      },
      items,
    };
  }

  async getMovements(query: QueryMovementsDto) {
    const { skip, take } = paginationSkip(query.page, query.limit);
    const where: Prisma.StockMovementWhereInput = {
      variantId: query.variantId,
      type: query.type,
      createdAt:
        query.from || query.to
          ? {
              gte: query.from ? new Date(query.from) : undefined,
              lte: query.to ? new Date(query.to) : undefined,
            }
          : undefined,
    };

    const [movements, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { variant: { include: { product: true } } },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return toPaginated(movements, total, query.page, query.limit);
  }

  async findLowStock() {
    const variants = await this.prisma.productVariant.findMany({
      where: { isArchived: false, product: { status: ProductStatus.ACTIVE } },
      include: {
        product: {
          include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
        },
      },
    });
    return variants
      .filter((v) => v.currentStock <= v.minStock)
      .map((v) => ({
        variantId: v.id,
        productName: v.product.name,
        variantName: v.name,
        image: v.product.images[0]?.url ?? null,
        currentStock: v.currentStock,
        minStock: v.minStock,
      }));
  }

  async getTotalStockValue(): Promise<number> {
    const variants = await this.prisma.productVariant.findMany({
      select: { currentStock: true, averageCost: true },
    });
    return variants.reduce((sum, v) => sum + v.currentStock * v.averageCost, 0);
  }

  private stockStatus(
    currentStock: number,
    minStock: number,
  ): 'SUFFICIENT' | 'LOW' | 'OUT' {
    if (currentStock <= 0) return 'OUT';
    if (currentStock <= minStock) return 'LOW';
    return 'SUFFICIENT';
  }
}
