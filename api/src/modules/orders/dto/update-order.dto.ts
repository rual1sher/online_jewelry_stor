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
import { CreateOrderItemDto } from './create-order.dto';

// Разрешено только пока заказ в статусе NEW/CONFIRMED — товар ещё не списан со склада.
export class UpdateOrderDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];

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
