import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { resolveDateRange } from '../../common/date-range.util';
import { DateRangeQueryDto } from '../../common/dto/date-range-query.dto';
import { UserRole } from '../../generated/prisma/client';
import { AnalyticsService } from '../analytics/analytics.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TopProductsQueryDto } from './dto/top-products-query.dto';

@UseGuards(RolesGuard)
@Roles(UserRole.OWNER)
@Controller('reports')
export class ReportsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue-dynamics')
  async revenueDynamics(@Query() query: DateRangeQueryDto) {
    const { from, to } = resolveDateRange(query.from, query.to);
    const series = await this.analyticsService.getDailySeries(from, to);
    return series.map(({ date, revenue }) => ({ date, revenue }));
  }

  @Get('profit-dynamics')
  async profitDynamics(@Query() query: DateRangeQueryDto) {
    const { from, to } = resolveDateRange(query.from, query.to);
    const series = await this.analyticsService.getDailySeries(from, to);
    return series.map(({ date, profit }) => ({ date, profit }));
  }

  @Get('expense-dynamics')
  expenseDynamics(@Query() query: DateRangeQueryDto) {
    const { from, to } = resolveDateRange(query.from, query.to);
    return this.analyticsService.getDailyExpenseSeries(from, to);
  }

  @Get('top-selling')
  topSelling(@Query() query: TopProductsQueryDto) {
    const { from, to } = resolveDateRange(query.from, query.to);
    return this.analyticsService.getTopProducts(
      from,
      to,
      query.limit ?? 10,
      'quantity',
    );
  }

  @Get('top-profitable')
  topProfitable(@Query() query: TopProductsQueryDto) {
    const { from, to } = resolveDateRange(query.from, query.to);
    return this.analyticsService.getTopProducts(
      from,
      to,
      query.limit ?? 10,
      'profit',
    );
  }
}
