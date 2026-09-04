import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ReportsController } from './reports.controller';

@Module({
  imports: [AnalyticsModule],
  controllers: [ReportsController],
})
export class ReportsModule {}
