import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@/generated/prisma/client';

export const taskListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  createdById: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
  overdue: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional()
    .default(false),
  sortBy: z
    .enum(['title', 'status', 'priority', 'dueDate', 'createdAt', 'updatedAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createTaskSchema = z
  .object({
    projectId: z.string().min(1, 'Dự án không được để trống'),
    title: z
      .string()
      .trim()
      .min(2, 'Tiêu đề phải chứa ít nhất 2 ký tự')
      .max(200, 'Tiêu đề tối đa 200 ký tự'),
    description: z.string().trim().optional(),
    assigneeId: z.string().min(1, 'Người phụ trách không được để trống'),
    priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.dueDate) {
        return data.startDate <= data.dueDate;
      }
      return true;
    },
    {
      message: 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu',
      path: ['dueDate'],
    }
  );

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, 'Tiêu đề phải chứa ít nhất 2 ký tự')
      .max(200, 'Tiêu đề tối đa 200 ký tự')
      .optional(),
    description: z.string().trim().optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    startDate: z.coerce.date().optional().nullable(),
    dueDate: z.coerce.date().optional(),
    progress: z.coerce.number().int().min(0).max(100).optional(),
    result: z.string().trim().optional().nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Phải cung cấp ít nhất một trường cần cập nhật.',
  });

export const changeTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const changeTaskAssigneeSchema = z.object({
  assigneeId: z.string().min(1, 'Người được giao không được để trống'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
