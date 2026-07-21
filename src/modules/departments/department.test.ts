import { describe, expect, it } from 'vitest';

import { AccountStatusError, AuthorizationError } from '@/lib/errors';
import {
  assertCanManageDepartments,
  assertCanViewDepartments,
  canManageDepartments,
  canViewDepartments,
} from './department.policy';
import {
  createDepartmentSchema,
  departmentIdSchema,
  departmentListQuerySchema,
  updateDepartmentSchema,
} from './department.schema';

describe('Department Policy', () => {
  const activeAdmin = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@lydinc.local',
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    departmentId: 'dept-1',
  };

  const activeManager = {
    id: 'mgr-1',
    name: 'Manager User',
    email: 'manager@lydinc.local',
    role: 'MANAGER' as const,
    status: 'ACTIVE' as const,
    departmentId: 'dept-1',
  };

  const activeMember = {
    id: 'mem-1',
    name: 'Member User',
    email: 'member@lydinc.local',
    role: 'MEMBER' as const,
    status: 'ACTIVE' as const,
    departmentId: 'dept-1',
  };

  const lockedAdmin = {
    ...activeAdmin,
    status: 'LOCKED' as const,
  };

  it('should allow active users (ADMIN, MANAGER, MEMBER) to view departments', () => {
    expect(canViewDepartments(activeAdmin)).toBe(true);
    expect(canViewDepartments(activeManager)).toBe(true);
    expect(canViewDepartments(activeMember)).toBe(true);
    expect(() => assertCanViewDepartments(activeMember)).not.toThrow();
  });

  it('should deny inactive or locked users from viewing departments', () => {
    expect(canViewDepartments(lockedAdmin)).toBe(false);
    expect(() => assertCanViewDepartments(lockedAdmin)).toThrow(AccountStatusError);
  });

  it('should only allow active ADMIN to manage departments', () => {
    expect(canManageDepartments(activeAdmin)).toBe(true);
    expect(canManageDepartments(activeManager)).toBe(false);
    expect(canManageDepartments(activeMember)).toBe(false);
    expect(canManageDepartments(lockedAdmin)).toBe(false);

    expect(() => assertCanManageDepartments(activeAdmin)).not.toThrow();
    expect(() => assertCanManageDepartments(activeManager)).toThrow(AuthorizationError);
    expect(() => assertCanManageDepartments(lockedAdmin)).toThrow(AccountStatusError);
  });
});

describe('Department Schema Validation', () => {
  it('should validate valid create input', () => {
    const result = createDepartmentSchema.safeParse({
      name: '  Chuyển đổi số  ',
      description: 'Phát triển phần mềm',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Chuyển đổi số');
      expect(result.data.description).toBe('Phát triển phần mềm');
    }
  });

  it('should reject empty or missing department name', () => {
    const emptyResult = createDepartmentSchema.safeParse({ name: '   ' });
    expect(emptyResult.success).toBe(false);

    const missingResult = createDepartmentSchema.safeParse({});
    expect(missingResult.success).toBe(false);
  });

  it('should validate partial update input and reject empty update payload', () => {
    const validUpdate = updateDepartmentSchema.safeParse({ name: 'Tên mới' });
    expect(validUpdate.success).toBe(true);

    const emptyUpdate = updateDepartmentSchema.safeParse({});
    expect(emptyUpdate.success).toBe(false);
  });

  it('should validate query parameters and parse includeCounts', () => {
    const queryResult = departmentListQuerySchema.safeParse({
      page: '2',
      pageSize: '10',
      search: 'STEAM',
      includeCounts: 'true',
    });

    expect(queryResult.success).toBe(true);
    if (queryResult.success) {
      expect(queryResult.data.page).toBe(2);
      expect(queryResult.data.pageSize).toBe(10);
      expect(queryResult.data.search).toBe('STEAM');
      expect(queryResult.data.includeCounts).toBe(true);
    }
  });

  it('should validate department ID path parameter', () => {
    const validId = departmentIdSchema.safeParse({ departmentId: 'dept-123' });
    expect(validId.success).toBe(true);

    const invalidId = departmentIdSchema.safeParse({ departmentId: '  ' });
    expect(invalidId.success).toBe(false);
  });
});
