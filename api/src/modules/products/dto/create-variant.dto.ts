import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  costPrice?: number;

  @IsInt()
  @Min(0)
  sellingPrice: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
