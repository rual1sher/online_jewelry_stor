import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExpenseCategoryDto) {
    try {
      return await this.prisma.expenseCategory.create({
        data: { name: dto.name },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Категория расходов с таким названием уже существует',
        );
      }
      throw error;
    }
  }

  findAll(includeArchived = false) {
    return this.prisma.expenseCategory.findMany({
      where: includeArchived ? undefined : { isArchived: false },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Категория расходов не найдена');
    }
    return category;
  }

  async update(id: string, dto: UpdateExpenseCategoryDto) {
    await this.findOne(id);
    try {
      return await this.prisma.expenseCategory.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Категория расходов с таким названием уже существует',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    const expensesCount = await this.prisma.expense.count({
      where: { categoryId: id },
    });
    if (expensesCount > 0) {
      throw new ConflictException(
        'Нельзя удалить категорию, в которой есть расходы — архивируйте её вместо удаления',
      );
    }
    await this.prisma.expenseCategory.delete({ where: { id } });
  }

  async archive(id: string) {
    await this.findOne(id);
    return this.prisma.expenseCategory.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async unarchive(id: string) {
    await this.findOne(id);
    return this.prisma.expenseCategory.update({
      where: { id },
      data: { isArchived: false },
    });
  }
}
