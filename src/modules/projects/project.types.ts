import type { ProjectStatus } from '@/generated/prisma/client';

export type ProjectListQueryInput = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ProjectStatus;
  departmentId?: string;
  managerId?: string;
  startFrom?: Date;
  startTo?: Date;
  endFrom?: Date;
  endTo?: Date;
  sortBy?: 'name' | 'code' | 'status' | 'startDate' | 'endDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

export type ProjectDTO = {
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
