import type { User, Department } from '@/generated/prisma/client';
import type { UserListItem } from './user.types';

type UserWithDepartment = User & {
  department: Department;
};

export function toUserListItem(user: UserWithDepartment): UserListItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    departmentId: user.departmentId,
    department: {
      id: user.department.id,
      name: user.department.name,
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
