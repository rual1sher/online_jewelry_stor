import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedUser, JwtPayload } from './types/jwt-payload.type';

const SALT_ROUNDS = 10;

const USER_LIST_SELECT = {
  id: true,
  phone: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; user: AuthenticatedUser }> {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Неверный телефон или пароль');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Неверный телефон или пароль');
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    };
    return {
      accessToken: this.signToken(authenticatedUser),
      user: authenticatedUser,
    };
  }

  async register(dto: RegisterDto): Promise<AuthenticatedUser> {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    try {
      const user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          passwordHash,
          name: dto.name,
          role: dto.role,
        },
      });
      return {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Пользователь с таким номером телефона уже существует',
        );
      }
      throw error;
    }
  }

  findAllUsers() {
    return this.prisma.user.findMany({
      select: USER_LIST_SELECT,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_LIST_SELECT,
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    await this.findUser(id);
    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, SALT_ROUNDS)
      : undefined;
    return this.prisma.user.update({
      where: { id },
      data: { name: dto.name, role: dto.role, passwordHash },
      select: USER_LIST_SELECT,
    });
  }

  async setActive(id: string, isActive: boolean) {
    await this.findUser(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: USER_LIST_SELECT,
    });
  }

  private signToken(user: AuthenticatedUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
