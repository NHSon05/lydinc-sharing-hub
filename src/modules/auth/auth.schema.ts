import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email không được để trống')
    .email('Email không đúng định dạng')
    .transform((val) => val.toLowerCase()),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;
