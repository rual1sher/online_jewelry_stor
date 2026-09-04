import { UserRole } from '../../../generated/prisma/client';

export interface JwtPayload {
  sub: string;
  phone: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
}
