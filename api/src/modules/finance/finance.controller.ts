import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { resolveDateRange } from '../../common/date-range.util';
import { UserRole } from '../../generated/prisma/client';
import { AnalyticsService } from '../analytics/analytics.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FinanceQueryDto } from './dto/finance-query.dto';

@UseGuards(RolesGuard)
@Roles(UserRole.OWNER)
@Controller('finance')
export class FinanceController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  summary(@Query() query: FinanceQueryDto) {
    const { from, to } = resolveDateRange(query.from, query.to);
    return this.analyticsService.getFinancialSummary(from, to);
  }
}
