import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreatePackagingDto {
  @IsString()
  @IsNotEmpty({ message: 'Название упаковки обязательно' })
  name: string;

  @IsInt({ message: 'Цена должна быть целым числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price: number;
}
