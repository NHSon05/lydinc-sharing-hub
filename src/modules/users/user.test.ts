import { describe, expect, it } from 'vitest';
import { AccountStatusError, AuthorizationError } from '@/lib/errors';
import {
  assertCanChangeOwnPassword,
  assertCanChangeUserStatus,
  assertCanCreateUser,
  assertCanListUsers,
  canCreateUser,
  canListUsers,
} from './user.policy';

import {
  changeOwnPasswordSchema,
  createUserSchema,
  updateUserSchema,
  userListQuerySchema,
} from './user.schema';

describe('User Policy Authorization', () => {
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

  it('should allow active ADMIN to list and create users', () => {
    expect(canListUsers(activeAdmin)).toBe(true);
    expect(canCreateUser(activeAdmin)).toBe(true);
    expect(() => assertCanListUsers(activeAdmin)).not.toThrow();
    expect(() => assertCanCreateUser(activeAdmin)).not.toThrow();
  });

  it('should deny MANAGER and MEMBER from creating users', () => {
    expect(canCreateUser(activeManager)).toBe(false);
    expect(canCreateUser(activeMember)).toBe(false);
    expect(() => assertCanCreateUser(activeManager)).toThrow(AuthorizationError);
    expect(() => assertCanCreateUser(activeMember)).toThrow(AuthorizationError);
  });

  it('should deny inactive/locked accounts from performing actions', () => {
    expect(() => assertCanListUsers(lockedAdmin)).toThrow(AccountStatusError);
    expect(() => assertCanChangeUserStatus(lockedAdmin)).toThrow(AccountStatusError);
  });

  it('should restrict self password change to matching user ID', () => {
    expect(() => assertCanChangeOwnPassword(activeMember, activeMember.id)).not.toThrow();
    expect(() => assertCanChangeOwnPassword(activeMember, 'other-id')).toThrow(AuthorizationError);
  });
});

describe('User Schema Validation', () => {
  it('should validate valid user creation payload', () => {
    const valid = createUserSchema.safeParse({
      name: '  Nguyễn Văn A  ',
      email: '  A@LYDINC.LOCAL  ',
      password: 'Password@123',
      role: 'MEMBER',
      departmentId: 'dept-123',
    });

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.name).toBe('Nguyễn Văn A');
      expect(valid.data.email).toBe('a@lydinc.local');
      expect(valid.data.password).toBe('Password@123');
    }
  });

  it('should reject invalid emails or passwords shorter than 8 chars', () => {
    const invalidEmail = createUserSchema.safeParse({
      name: 'User Test',
      email: 'not-an-email',
      password: 'Password@123',
      departmentId: 'dept-1',
    });
    expect(invalidEmail.success).toBe(false);

    const shortPassword = createUserSchema.safeParse({
      name: 'User Test',
      email: 'test@lydinc.local',
      password: 'short',
      departmentId: 'dept-1',
    });
    expect(shortPassword.success).toBe(false);
  });

  it('should enforce non-empty payload on user profile update', () => {
    const validUpdate = updateUserSchema.safeParse({ name: 'Name Changed' });
    expect(validUpdate.success).toBe(true);

    const emptyUpdate = updateUserSchema.safeParse({});
    expect(emptyUpdate.success).toBe(false);
  });

  it('should validate list query filters and default pagination', () => {
    const parsed = userListQuerySchema.safeParse({
      page: '2',
      pageSize: '10',
      search: 'nguyen',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.page).toBe(2);
      expect(parsed.data.pageSize).toBe(10);
      expect(parsed.data.search).toBe('nguyen');
      expect(parsed.data.role).toBe('ADMIN');
      expect(parsed.data.status).toBe('ACTIVE');
    }
  });

  it('should reject new password matching current password', () => {
    const samePassword = changeOwnPasswordSchema.safeParse({
      currentPassword: 'Password@123',
      newPassword: 'Password@123',
    });
    expect(samePassword.success).toBe(false);
  });
});
