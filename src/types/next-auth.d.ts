import type { UserRole, UserStatus } from '@/generated/prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    departmentId: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      status: UserStatus;
      departmentId: string;
    };
  }
}

declare module '@auth/core/types' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    departmentId: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      status: UserStatus;
      departmentId: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
    status: UserStatus;
    departmentId: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
    status: UserStatus;
    departmentId: string;
  }
}
