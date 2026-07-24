import type { UserRole, UserStatus } from '@/generated/prisma/client';

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  departmentId: string;
  department: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type UserDetail = UserListItem;

export type PaginatedUsers = {
  items: UserListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};
