import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateReceiptDto {
  @IsString()
  variantId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(0)
  purchasePricePerUnit: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  packagingPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  additionalCosts?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
