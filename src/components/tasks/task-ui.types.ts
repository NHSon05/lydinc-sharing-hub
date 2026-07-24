import type { TaskStatus, TaskPriority } from '@/generated/prisma/client';

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  startDate: string | null;
  dueDate: string;
  completedAt: string | null;
  result: string | null;
  isOverdue: boolean;
  project: {
    id: string;
    code: string;
    name: string;
    managerId?: string;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectOption {
  id: string;
  code: string;
  name: string;
  endDate: string;
  status: string;
}

export interface ProjectMemberOption {
  id: string;
  name: string;
  email: string;
  status: string;
  projectId?: string;
}

export interface TaskPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
