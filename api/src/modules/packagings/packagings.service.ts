import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { UpdatePackagingDto } from './dto/update-packaging.dto';

@Injectable()
export class PackagingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePackagingDto) {
    try {
      return await this.prisma.packaging.create({
        data: {
          name: dto.name,
          price: dto.price,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Упаковка с таким названием уже существует',
        );
      }
      throw error;
    }
  }

  findAll(includeArchived = false) {
    return this.prisma.packaging.findMany({
      where: includeArchived ? undefined : { isArchived: false },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const packaging = await this.prisma.packaging.findUnique({ where: { id } });
    if (!packaging) {
      throw new NotFoundException('Упаковка не найдена');
    }
    return packaging;
  }

  async update(id: string, dto: UpdatePackagingDto) {
    await this.findOne(id);
    try {
      return await this.prisma.packaging.update({ where: { id }, data: dto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Упаковка с таким названием уже существует',
        );
      }
      throw error;
    }
  }

  async archive(id: string) {
    await this.findOne(id);
    return this.prisma.packaging.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async unarchive(id: string) {
    await this.findOne(id);
    return this.prisma.packaging.update({
      where: { id },
      data: { isArchived: false },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const ordersCount = await this.prisma.order.count({
      where: { packagingId: id },
    });
    if (ordersCount > 0) {
      throw new ConflictException(
        'Нельзя удалить упаковку, которая используется в заказах — сначала архивируйте её',
      );
    }
    await this.prisma.packaging.delete({ where: { id } });
  }
}
