import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { paginationSkip, toPaginated } from '../../common/pagination.util';
import {
  OrderStatus,
  Prisma,
  ProductStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { deleteUploadedFileIfLocal } from '../uploads/uploads.util';
import { AddImageDto } from './dto/add-image.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: {
          name: dto.name,
          description: dto.description,
          categoryId: dto.categoryId,
          images: dto.imageUrls
            ? {
                create: dto.imageUrls.map((url, index) => ({
                  url,
                  sortOrder: index,
                })),
              }
            : undefined,
          variants: {
            create: dto.variants.map((variant) => ({
              name: variant.name,
              currentStock: variant.stock ?? 0,
              averageCost: variant.costPrice ?? 0,
              sellingPrice: variant.sellingPrice,
              minStock: variant.minStock ?? 0,
            })),
          },
        },
        include: { images: true, variants: true, category: true },
      });
    } catch (error) {
      throw this.mapKnownError(error);
    }
  }

  async findAll(query: QueryProductsDto) {
    const { skip, take } = paginationSkip(query.page, query.limit);
    const where: Prisma.ProductWhereInput = {
      categoryId: query.categoryId,
      status: query.status,
      ...(query.search
        ? {
            name: { contains: query.search, mode: 'insensitive' },
          }
        : {}),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          variants: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const allVariantIds = products.flatMap((p) => p.variants.map((v) => v.id));
    const soldAgg = allVariantIds.length
      ? await this.prisma.orderItem.groupBy({
          by: ['variantId'],
          where: { variantId: { in: allVariantIds } },
          _sum: { quantity: true },
        })
      : [];
    const soldByVariant = new Map(
      soldAgg.map((s) => [s.variantId, s._sum.quantity ?? 0]),
    );

    const items = products.map((product) => {
      const totalStock = product.variants.reduce(
        (sum, v) => sum + v.currentStock,
        0,
      );
      const totalSold = product.variants.reduce(
        (sum, v) => sum + (soldByVariant.get(v.id) ?? 0),
        0,
      );
      const totalReceived = totalStock + totalSold;

      return {
        id: product.id,
        name: product.name,
        status: product.status,
        category: product.category,
        image: product.images[0]?.url ?? null,
        variantsCount: product.variants.length,
        totalReceived,
        totalSold,
        totalStock,
        costPriceFrom: product.variants.length
          ? Math.min(...product.variants.map((v) => v.averageCost))
          : 0,
        sellingPriceFrom: product.variants.length
          ? Math.min(...product.variants.map((v) => v.sellingPrice))
          : 0,
      };
    });

    return toPaginated(items, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    const variantIds = product.variants.map((v) => v.id);

    const [soldAgg, deliveredAgg, variantSoldAgg] = await Promise.all([
      this.prisma.orderItem.aggregate({
        where: { variantId: { in: variantIds } },
        _sum: { quantity: true },
      }),
      this.prisma.orderItem.findMany({
        where: {
          variantId: { in: variantIds },
          order: { status: OrderStatus.DELIVERED },
        },
        select: { quantity: true, priceAtSale: true, costAtSale: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['variantId'],
        where: { variantId: { in: variantIds } },
        _sum: { quantity: true },
      }),
    ]);

    const variantSoldMap = new Map(
      variantSoldAgg.map((s) => [s.variantId, s._sum.quantity ?? 0]),
    );

    const totalRevenue = deliveredAgg.reduce(
      (sum, i) => sum + i.quantity * i.priceAtSale,
      0,
    );
    const totalCost = deliveredAgg.reduce(
      (sum, i) => sum + i.quantity * i.costAtSale,
      0,
    );

    const currentTotalStock = product.variants.reduce(
      (sum, v) => sum + v.currentStock,
      0,
    );
    const totalSold = soldAgg._sum.quantity ?? 0;
    const totalReceived = currentTotalStock + totalSold;

    const variantsWithStats = product.variants.map((v) => {
      const sold = variantSoldMap.get(v.id) ?? 0;
      return {
        ...v,
        sold,
        received: v.currentStock + sold,
      };
    });

    return {
      ...product,
      variants: variantsWithStats,
      stats: {
        totalReceived,
        totalSold,
        currentTotalStock,
        totalStockValue: product.variants.reduce(
          (sum, v) => sum + v.currentStock * v.averageCost,
          0,
        ),
        totalRevenue,
        totalProfit: totalRevenue - totalCost,
      },
    };
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.assertExists(id);
    try {
      return await this.prisma.product.update({ where: { id }, data: dto });
    } catch (error) {
      throw this.mapKnownError(error);
    }
  }

  async archive(id: string) {
    await this.assertExists(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });
  }

  async unarchive(id: string) {
    await this.assertExists(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ACTIVE },
    });
  }

  async addVariant(productId: string, dto: CreateVariantDto) {
    await this.assertExists(productId);
    try {
      return await this.prisma.productVariant.create({
        data: {
          productId,
          name: dto.name,
          currentStock: dto.stock ?? 0,
          averageCost: dto.costPrice ?? 0,
          sellingPrice: dto.sellingPrice,
          minStock: dto.minStock ?? 0,
        },
      });
    } catch (error) {
      throw this.mapKnownError(error);
    }
  }

  async updateVariant(variantId: string, dto: UpdateVariantDto) {
    await this.assertVariantExists(variantId);
    const { costPrice, stock, ...rest } = dto;
    try {
      return await this.prisma.productVariant.update({
        where: { id: variantId },
        data: {
          ...rest,
          ...(costPrice !== undefined ? { averageCost: costPrice } : {}),
          ...(stock !== undefined ? { currentStock: stock } : {}),
        },
      });
    } catch (error) {
      throw this.mapKnownError(error);
    }
  }

  // Вариант не удаляется физически (на него могут ссылаться приходы/заказы),
  // а архивируется — пропадает из продажи и из активного склада, но остаётся в истории.
  async archiveVariant(variantId: string) {
    await this.assertVariantExists(variantId);
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { isArchived: true },
    });
  }

  async unarchiveVariant(variantId: string) {
    await this.assertVariantExists(variantId);
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { isArchived: false },
    });
  }

  async addImage(productId: string, dto: AddImageDto) {
    await this.assertExists(productId);
    return this.prisma.productImage.create({
      data: { productId, url: dto.url, sortOrder: dto.sortOrder ?? 0 },
    });
  }

  async removeImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }
    await this.prisma.productImage.delete({ where: { id: imageId } });
    await deleteUploadedFileIfLocal(image.url);
  }

  async history(variantId: string) {
    await this.assertVariantExists(variantId);
    return this.prisma.stockMovement.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async assertExists(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Товар не найден');
    }
    return product;
  }

  private async assertVariantExists(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });
    if (!variant) {
      throw new NotFoundException('Вариант товара не найден');
    }
    return variant;
  }

  private mapKnownError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException('Запись с такими данными уже существует');
    }
    return error;
  }
}
