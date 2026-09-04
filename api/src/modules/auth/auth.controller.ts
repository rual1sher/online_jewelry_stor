import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../../generated/prisma/client';
import type { AuthenticatedUser } from './types/jwt-payload.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @Get('users')
  findAllUsers() {
    return this.authService.findAllUsers();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @Get('users/:id')
  findUser(@Param('id') id: string) {
    return this.authService.findUser(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.authService.updateUser(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch('users/:id/deactivate')
  deactivateUser(@Param('id') id: string) {
    return this.authService.setActive(id, false);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string) {
    return this.authService.setActive(id, true);
  }
}
