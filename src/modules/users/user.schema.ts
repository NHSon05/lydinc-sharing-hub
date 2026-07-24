import { z } from 'zod';
import { UserRole, UserStatus } from '@/generated/prisma/client';

export const userIdParamsSchema = z.object({
  userId: z.string().trim().min(1, 'ID người dùng là bắt buộc'),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  departmentId: z.string().trim().optional(),
  sortBy: z.enum(['name', 'email', 'role', 'status', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createUserSchema = z.object({
  name: z
    .string({ required_error: 'Họ và tên là bắt buộc' })
    .trim()
    .min(1, 'Họ và tên không được để trống')
    .max(150, 'Họ và tên tối đa 150 ký tự'),
  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .trim()
    .email('Email không đúng định dạng')
    .transform((val) => val.toLowerCase()),
  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc' })
    .min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  role: z.nativeEnum(UserRole).default(UserRole.MEMBER),
  departmentId: z
    .string({ required_error: 'Phòng ban là bắt buộc' })
    .trim()
    .min(1, 'Phòng ban không được để trống'),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, 'Họ và tên không được để trống').max(150, 'Họ và tên tối đa 150 ký tự').optional(),
    email: z
      .string()
      .trim()
      .email('Email không đúng định dạng')
      .transform((val) => val.toLowerCase())
      .optional(),
    role: z.nativeEnum(UserRole).optional(),
    departmentId: z.string().trim().min(1, 'Phòng ban không được để trống').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Phải cung cấp ít nhất một trường cần cập nhật.',
  });

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus, { required_error: 'Trạng thái là bắt buộc' }),
});

export const changeOwnPasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Mật khẩu hiện tại là bắt buộc' })
      .min(1, 'Mật khẩu hiện tại không được để trống'),
    newPassword: z
      .string({ required_error: 'Mật khẩu mới là bắt buộc' })
      .min(8, 'Mật khẩu mới tối thiểu 8 ký tự'),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
    path: ['newPassword'],
  });

export const resetUserPasswordSchema = z.object({
  newPassword: z
    .string({ required_error: 'Mật khẩu mới là bắt buộc' })
    .min(8, 'Mật khẩu mới tối thiểu 8 ký tự'),
});

export type UserIdParamsInput = z.infer<typeof userIdParamsSchema>;
export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type ChangeOwnPasswordInput = z.infer<typeof changeOwnPasswordSchema>;
export type ResetUserPasswordInput = z.infer<typeof resetUserPasswordSchema>;
