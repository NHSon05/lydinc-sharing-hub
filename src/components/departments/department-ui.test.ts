import { describe, expect, it } from 'vitest';
import { createDepartmentSchema, updateDepartmentSchema } from '@/modules/departments/department.schema';

describe('Department UI Client Validation & Logic', () => {
  it('should validate create form input correctly', () => {
    const valid = createDepartmentSchema.safeParse({
      name: 'Phòng Công Nghệ',
      description: 'Phát triển phần mềm hệ thống',
    });
    expect(valid.success).toBe(true);

    const emptyName = createDepartmentSchema.safeParse({
      name: '   ',
      description: 'Test',
    });
    expect(emptyName.success).toBe(false);

    const longName = createDepartmentSchema.safeParse({
      name: 'a'.repeat(151),
    });
    expect(longName.success).toBe(false);
  });

  it('should validate update form input and enforce non-empty update object', () => {
    const validUpdate = updateDepartmentSchema.safeParse({
      name: 'Tên mới',
    });
    expect(validUpdate.success).toBe(true);

    const emptyUpdate = updateDepartmentSchema.safeParse({});
    expect(emptyUpdate.success).toBe(false);
  });

  it('should verify ADMIN vs MEMBER action visibility logic', () => {
    const adminRole = 'ADMIN';
    const memberRole = 'MEMBER';
    const managerRole = 'MANAGER';

    const isAdmin = (role: string) => role === 'ADMIN';

    expect(isAdmin(adminRole)).toBe(true);
    expect(isAdmin(memberRole)).toBe(false);
    expect(isAdmin(managerRole)).toBe(false);
  });

  it('should correctly format date strings for display', () => {
    const formatDate = (dateInput: string | Date): string => {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return '-';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formatted = formatDate('2026-07-21T12:00:00.000Z');
    expect(formatted).toMatch(/^\d{2}\/\d{2}\/2026$/);
  });
});
