import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { QueryMovementsDto } from './dto/query-movements.dto';
import { InventoryService } from './inventory.service';

@UseGuards(RolesGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getStockTable(@Query('includeArchived') includeArchived?: string) {
    return this.inventoryService.getStockTable(includeArchived === 'true');
  }

  @Get('low-stock')
  getLowStock() {
    return this.inventoryService.findLowStock();
  }

  @Get('movements')
  getMovements(@Query() query: QueryMovementsDto) {
    return this.inventoryService.getMovements(query);
  }

  @Post('receipts')
  createReceipt(@Body() dto: CreateReceiptDto) {
    return this.inventoryService.createReceipt(dto);
  }

  @Post('adjustments')
  createAdjustment(@Body() dto: CreateAdjustmentDto) {
    return this.inventoryService.createAdjustment(dto);
  }
}
