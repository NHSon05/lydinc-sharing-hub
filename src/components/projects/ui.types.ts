import type { ProjectMemberRole } from '@/generated/prisma/client';

export type ProjectMemberItem = {
  id: string;
  role: ProjectMemberRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    department: {
      id: string;
      name: string;
    };
  };
};

export type MemberCandidateItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: {
    id: string;
    name: string;
  };
};

export type MemberRoleOption = {
  value: string;
  label: string;
};

export const MEMBER_ROLE_OPTIONS: MemberRoleOption[] = [
  { value: 'OWNER', label: 'Chủ sở hữu' },
  { value: 'MANAGER', label: 'Quản lý' },
  { value: 'MEMBER', label: 'Thành viên' },
  { value: 'VIEWER', label: 'Người xem' },
];

export const PROJECT_MEMBER_ROLE_LABELS: Record<string, string> = {
  OWNER: 'Chủ sở hữu',
  MANAGER: 'Quản lý',
  MEMBER: 'Thành viên',
  VIEWER: 'Người xem',
};
