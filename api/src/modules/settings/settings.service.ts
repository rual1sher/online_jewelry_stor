import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { deleteUploadedFileIfLocal } from '../uploads/uploads.util';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const DEFAULT_STORE_NAME = 'Мой ювелирный магазин';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.storeSettings.findFirst();
    if (existing) {
      return existing;
    }
    return this.prisma.storeSettings.create({
      data: { storeName: DEFAULT_STORE_NAME },
    });
  }

  async update(dto: UpdateSettingsDto) {
    const settings = await this.get();
    const updated = await this.prisma.storeSettings.update({
      where: { id: settings.id },
      data: dto,
    });
    if (dto.logoUrl !== undefined && dto.logoUrl !== settings.logoUrl) {
      await deleteUploadedFileIfLocal(settings.logoUrl);
    }
    return updated;
  }
}
