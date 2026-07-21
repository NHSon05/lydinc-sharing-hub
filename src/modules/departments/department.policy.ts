import { AccountStatusError, AuthorizationError } from '@/lib/errors';
import type { SessionUser } from '@/modules/auth/auth.types';

/**
 * Checks if the user account status is ACTIVE.
 */
export function isUserActive(user: SessionUser): boolean {
  return user?.status === 'ACTIVE';
}

/**
 * Checks if user can view department list/details.
 * Business Rule: Any authenticated user with status ACTIVE.
 */
export function canViewDepartments(user: SessionUser): boolean {
  return isUserActive(user);
}

/**
 * Checks if user can manage departments (create, edit, delete).
 * Business Rule: Only ACTIVE users with ADMIN role.
 */
export function canManageDepartments(user: SessionUser): boolean {
  return isUserActive(user) && user.role === 'ADMIN';
}

export function canCreateDepartment(user: SessionUser): boolean {
  return canManageDepartments(user);
}

export function canUpdateDepartment(user: SessionUser): boolean {
  return canManageDepartments(user);
}

export function canDeleteDepartment(user: SessionUser): boolean {
  return canManageDepartments(user);
}

/**
 * Server-side assertion for viewing departments.
 * Throws AccountStatusError if inactive/locked.
 */
export function assertCanViewDepartments(user: SessionUser): void {
  if (!isUserActive(user)) {
    throw new AccountStatusError();
  }
}

/**
 * Server-side assertion for managing departments (create, update, delete).
 * Throws AccountStatusError if account is not ACTIVE.
 * Throws AuthorizationError if user role is not ADMIN.
 */
export function assertCanManageDepartments(user: SessionUser): void {
  if (!isUserActive(user)) {
    throw new AccountStatusError();
  }
  if (user.role !== 'ADMIN') {
    throw new AuthorizationError(
      'Chỉ quản trị viên (ADMIN) mới có quyền thực hiện thao tác này.',
    );
  }
}
