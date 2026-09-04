import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({ data: { name: dto.name } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Категория с таким названием уже существует',
        );
      }
      throw error;
    }
  }

  findAll(includeArchived = false) {
    return this.prisma.category.findMany({
      where: includeArchived ? undefined : { isArchived: false },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    try {
      return await this.prisma.category.update({ where: { id }, data: dto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Категория с таким названием уже существует',
        );
      }
      throw error;
    }
  }

  async archive(id: string) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async unarchive(id: string) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { isArchived: false },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const productsCount = await this.prisma.product.count({
      where: { categoryId: id },
    });
    if (productsCount > 0) {
      throw new ConflictException(
        'Нельзя удалить категорию, в которой есть товары — сначала перенесите товары или архивируйте категорию',
      );
    }
    await this.prisma.category.delete({ where: { id } });
  }
}
