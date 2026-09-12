import { Injectable, NotFoundException } from '@nestjs/common';
import { paginationSkip, toPaginated } from '../../common/pagination.util';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { deleteUploadedFileIfLocal } from '../uploads/uploads.util';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        categoryId: dto.categoryId,
        title: dto.title,
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : undefined,
        comment: dto.comment,
        receiptPhotoUrl: dto.receiptPhotoUrl,
      },
      include: { category: true },
    });
  }

  async findAll(query: QueryExpensesDto) {
    const { skip, take } = paginationSkip(query.page, query.limit);
    const where: Prisma.ExpenseWhereInput = {
      categoryId: query.categoryId,
      date:
        query.from || query.to
          ? {
              gte: query.from ? new Date(query.from) : undefined,
              lte: query.to ? new Date(query.to) : undefined,
            }
          : undefined,
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [expenses, total, sumAgg] = await this.prisma.$transaction([
      this.prisma.expense.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { category: true },
      }),
      this.prisma.expense.count({ where }),
      this.prisma.expense.aggregate({ where, _sum: { amount: true } }),
    ]);

    return {
      ...toPaginated(expenses, total, query.page, query.limit),
      totalAmount: sumAgg._sum.amount ?? 0,
    };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!expense) {
      throw new NotFoundException('Расход не найден');
    }
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.expense.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
      include: { category: true },
    });
    if (
      dto.receiptPhotoUrl !== undefined &&
      dto.receiptPhotoUrl !== existing.receiptPhotoUrl
    ) {
      await deleteUploadedFileIfLocal(existing.receiptPhotoUrl);
    }
    return updated;
  }

  async remove(id: string) {
    const expense = await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
    await deleteUploadedFileIfLocal(expense.receiptPhotoUrl);
  }

  // Используется финансовыми/аналитическими модулями.
  async getTotalForRange(from: Date, to: Date): Promise<number> {
    const agg = await this.prisma.expense.aggregate({
      where: { date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    return agg._sum.amount ?? 0;
  }
}
