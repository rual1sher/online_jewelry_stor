import { Module } from '@nestjs/common';
import { PackagingsController } from './packagings.controller';
import { PackagingsService } from './packagings.service';

@Module({
  controllers: [PackagingsController],
  providers: [PackagingsService],
  exports: [PackagingsService],
})
export class PackagingsModule {}
