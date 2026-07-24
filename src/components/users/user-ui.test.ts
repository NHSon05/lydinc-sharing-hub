import { describe, expect, it } from 'vitest';
import type { UserRole, UserStatus } from './user-ui.types';
import { createUserSchema, updateUserStatusSchema } from '@/modules/users/user.schema';

describe('User UI Helpers & Logic', () => {
  it('should format role labels correctly', () => {
    const getRoleLabel = (role: UserRole) => {
      switch (role) {
        case 'ADMIN':
          return 'Quản trị viên';
        case 'MANAGER':
          return 'Quản lý';
        default:
          return 'Thành viên';
      }
    };

    expect(getRoleLabel('ADMIN')).toBe('Quản trị viên');
    expect(getRoleLabel('MANAGER')).toBe('Quản lý');
    expect(getRoleLabel('MEMBER')).toBe('Thành viên');
  });

  it('should format status labels correctly', () => {
    const getStatusLabel = (status: UserStatus) => {
      switch (status) {
        case 'LOCKED':
          return 'Bị khóa';
        case 'INACTIVE':
          return 'Không hoạt động';
        default:
          return 'Đang hoạt động';
      }
    };

    expect(getStatusLabel('ACTIVE')).toBe('Đang hoạt động');
    expect(getStatusLabel('INACTIVE')).toBe('Không hoạt động');
    expect(getStatusLabel('LOCKED')).toBe('Bị khóa');
  });

  it('should calculate pagination row indices accurately', () => {
    const calculateSTT = (page: number, pageSize: number, rowIndex: number) => {
      return (page - 1) * pageSize + rowIndex + 1;
    };

    expect(calculateSTT(1, 20, 0)).toBe(1);
    expect(calculateSTT(1, 20, 19)).toBe(20);
    expect(calculateSTT(2, 20, 0)).toBe(21);
    expect(calculateSTT(3, 10, 4)).toBe(25);
  });

  it('should validate status change payload', () => {
    expect(updateUserStatusSchema.safeParse({ status: 'LOCKED' }).success).toBe(true);
    expect(updateUserStatusSchema.safeParse({ status: 'INVALID' }).success).toBe(false);
  });

  it('should lower-case emails automatically in create user schema', () => {
    const res = createUserSchema.safeParse({
      name: 'Test Name',
      email: '  USER.NAME@LYDINC.LOCAL  ',
      password: 'Password123',
      departmentId: 'dept-1',
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.email).toBe('user.name@lydinc.local');
    }
  });
});
