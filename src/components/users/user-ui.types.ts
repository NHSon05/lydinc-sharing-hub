export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

export type UserItem = {
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
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DepartmentOption = {
  id: string;
  name: string;
};

export type UserPaginationInfo = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
