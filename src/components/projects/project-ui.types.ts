export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export type ProjectItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  department: {
    id: string;
    name: string;
  };
  manager: {
    id: string;
    name: string;
    email?: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  taskSummary: {
    total: number;
    todo?: number;
    inProgress?: number;
    review?: number;
    completed: number;
    cancelled?: number;
    overdue?: number;
  };
  memberCount: number;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentOption = {
  id: string;
  name: string;
};

export type ManagerOption = {
  id: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
};

export type ProjectPaginationInfo = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
