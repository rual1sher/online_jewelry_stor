import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  sku: string;

  @IsInt()
  @Min(0)
  sellingPrice: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;
}
