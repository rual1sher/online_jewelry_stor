import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { DeliveryPayer } from '../../../generated/prisma/client';

export class CreateOrderItemDto {
  @IsString()
  variantId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceAtSale?: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  packagingId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  packagingPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryPrice?: number;

  @IsOptional()
  @IsEnum(DeliveryPayer)
  deliveryPaidBy?: DeliveryPayer;

  @IsOptional()
  @IsString()
  comment?: string;
}
