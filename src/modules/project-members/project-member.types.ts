import type { ProjectMemberRole, UserStatus, UserRole } from '@/generated/prisma/client';

export type ProjectMemberDTO = {
  id: string;
  role: ProjectMemberRole;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    department: {
      id: string;
      name: string;
    };
  };
};

export type MemberCandidateDTO = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: {
    id: string;
    name: string;
  };
};

export type ProjectMemberListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: ProjectMemberRole;
};
