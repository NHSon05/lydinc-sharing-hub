import type { UserRole, UserStatus } from '@/generated/prisma/client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  departmentId: string;
};

export type SessionUser = AuthUser;

export type LoginInput = {
  email: string;
  password: string;
};
