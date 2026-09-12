import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { UpdatePackagingDto } from './dto/update-packaging.dto';
import { PackagingsService } from './packagings.service';

@UseGuards(RolesGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER)
@Controller('packagings')
export class PackagingsController {
  constructor(private readonly packagingsService: PackagingsService) {}

  @Post()
  create(@Body() dto: CreatePackagingDto) {
    return this.packagingsService.create(dto);
  }

  @Get()
  findAll(@Query('includeArchived') includeArchived?: string) {
    return this.packagingsService.findAll(includeArchived === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePackagingDto) {
    return this.packagingsService.update(id, dto);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.packagingsService.archive(id);
  }

  @Patch(':id/unarchive')
  unarchive(@Param('id') id: string) {
    return this.packagingsService.unarchive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagingsService.remove(id);
  }
}
