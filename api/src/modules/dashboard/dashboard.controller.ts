import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { resolveDateRange } from '../../common/date-range.util';
import { UserRole } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@UseGuards(RolesGuard)
@Roles(UserRole.OWNER)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getOverview(@Query() query: DashboardQueryDto) {
    const { from, to } = resolveDateRange(query.from, query.to);
    return this.dashboardService.getOverview(from, to);
  }
}
