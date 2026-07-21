import { z } from 'zod';

export const departmentIdSchema = z.object({
  departmentId: z.string().trim().min(1, 'ID phòng ban là bắt buộc'),
});

export const createDepartmentSchema = z.object({
  name: z
    .string({ required_error: 'Tên phòng ban là bắt buộc' })
    .trim()
    .min(1, 'Tên phòng ban không được để trống')
    .max(150, 'Tên phòng ban tối đa 150 ký tự'),
  description: z
    .string()
    .trim()
    .max(1000, 'Mô tả phòng ban tối đa 1000 ký tự')
    .optional(),
});

export const updateDepartmentSchema = createDepartmentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Phải cung cấp ít nhất một trường cần cập nhật.',
  });

export const departmentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  includeCounts: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional()
    .default(false),
});

export type DepartmentIdParams = z.infer<typeof departmentIdSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DepartmentListQueryInput = z.infer<
  typeof departmentListQuerySchema
>;
