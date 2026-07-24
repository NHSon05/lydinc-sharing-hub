import type { TaskStatus, TaskPriority } from '@/generated/prisma/client';

export type TaskListQueryInput = {
  page?: number;
  pageSize?: number;
  search?: string;
  projectId?: string;
  assigneeId?: string;
  createdById?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueFrom?: Date;
  dueTo?: Date;
  overdue?: boolean;
  sortBy?: 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};

export type TaskDTO = {
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
};
