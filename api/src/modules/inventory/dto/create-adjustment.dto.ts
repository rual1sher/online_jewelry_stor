import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AdjustmentReason } from '../../../generated/prisma/client';

export class CreateAdjustmentDto {
  @IsString()
  variantId: string;

  @IsInt()
  @Min(0)
  actualQuantity: number;

  @IsEnum(AdjustmentReason)
  reason: AdjustmentReason;

  @IsOptional()
  @IsString()
  comment?: string;
}
