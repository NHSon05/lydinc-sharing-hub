import { z } from 'zod';
import { ProjectMemberRole } from '@/generated/prisma/client';

export const addProjectMemberSchema = z.object({
  userId: z.string().min(1, 'Người dùng không được để trống'),
  role: z.nativeEnum(ProjectMemberRole).default(ProjectMemberRole.MEMBER),
});

export const updateProjectMemberRoleSchema = z.object({
  role: z.nativeEnum(ProjectMemberRole, {
    errorMap: () => ({ message: 'Vai trò không hợp lệ.' }),
  }),
});

export const projectMemberListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  role: z.nativeEnum(ProjectMemberRole).optional(),
});

export const memberCandidatesQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
export type UpdateProjectMemberRoleInput = z.infer<typeof updateProjectMemberRoleSchema>;
