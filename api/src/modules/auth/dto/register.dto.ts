import { IsEnum, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../generated/prisma/client';

export class RegisterDto {
  @IsPhoneNumber('UZ')
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsEnum(UserRole)
  role: UserRole;
}
