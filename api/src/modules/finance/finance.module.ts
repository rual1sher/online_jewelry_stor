import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { FinanceController } from './finance.controller';

@Module({
  imports: [AnalyticsModule],
  controllers: [FinanceController],
})
export class FinanceModule {}
