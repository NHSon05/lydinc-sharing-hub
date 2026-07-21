import type { Department } from '@/generated/prisma/client';

export type DepartmentWithCounts = Department & {
  counts?: {
    users: number;
    projects: number;
  };
};

export type DepartmentResponse = {
  id: string;
  name: string;
  description: string | null;
  counts?: {
    users: number;
    projects: number;
  };
  createdAt: Date;
  updatedAt: Date;
};
