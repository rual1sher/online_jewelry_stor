import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class AddImageDto {
  @IsString()
  @MinLength(1)
  url: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
