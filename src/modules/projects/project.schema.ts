import { z } from 'zod';
import { ProjectStatus, ProjectMemberRole } from '@/generated/prisma/client';

export const projectListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
  startFrom: z.coerce.date().optional(),
  startTo: z.coerce.date().optional(),
  endFrom: z.coerce.date().optional(),
  endTo: z.coerce.date().optional(),
  sortBy: z
    .enum(['name', 'code', 'status', 'startDate', 'endDate', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createProjectSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, 'Mã dự án phải chứa ít nhất 2 ký tự')
      .max(50, 'Mã dự án tối đa 50 ký tự')
      .toUpperCase(),
    name: z
      .string()
      .trim()
      .min(2, 'Tên dự án phải chứa ít nhất 2 ký tự')
      .max(255, 'Tên dự án tối đa 255 ký tự'),
    description: z.string().trim().optional(),
    departmentId: z.string().min(1, 'Bộ phận không được để trống'),
    managerId: z.string().min(1, 'Người quản lý không được để trống'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
    members: z
      .array(
        z.object({
          userId: z.string().min(1),
          role: z.nativeEnum(ProjectMemberRole).default(ProjectMemberRole.MEMBER),
        })
      )
      .optional()
      .default([]),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu',
    path: ['endDate'],
  });

export const updateProjectSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, 'Mã dự án phải chứa ít nhất 2 ký tự')
      .max(50, 'Mã dự án tối đa 50 ký tự')
      .toUpperCase()
      .optional(),
    name: z
      .string()
      .trim()
      .min(2, 'Tên dự án phải chứa ít nhất 2 ký tự')
      .max(255, 'Tên dự án tối đa 255 ký tự')
      .optional(),
    description: z.string().trim().optional(),
    departmentId: z.string().optional(),
    managerId: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Phải cung cấp ít nhất một trường cần cập nhật.',
  });

export const updateProjectStatusSchema = z.object({
  status: z.nativeEnum(ProjectStatus),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
