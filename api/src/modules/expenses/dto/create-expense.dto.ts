import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  categoryId: string;

  @IsString()
  @MinLength(1)
  title: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsISO8601()
  date?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  receiptPhotoUrl?: string;
}
