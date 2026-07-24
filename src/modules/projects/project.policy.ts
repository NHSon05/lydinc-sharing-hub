import { AccountStatusError, AuthorizationError } from '@/lib/errors';
import type { SessionUser } from '@/modules/auth/auth.types';

export function isUserActive(user: SessionUser) {
  if (user.status !== 'ACTIVE') {
    throw new AccountStatusError('Tài khoản đã bị khóa hoặc chưa kích hoạt.');
  }
}

export function canViewProjects(user: SessionUser): boolean {
  try {
    isUserActive(user);
    return true;
  } catch {
    return false;
  }
}

export function canCreateProject(user: SessionUser): boolean {
  try {
    isUserActive(user);
    return user.role === 'ADMIN' || user.role === 'MANAGER';
  } catch {
    return false;
  }
}

export function canManageProject(
  user: SessionUser,
  project: { managerId: string }
): boolean {
  try {
    isUserActive(user);
    if (user.role === 'ADMIN') return true;
    if (user.role === 'MANAGER' && project.managerId === user.id) return true;
    return false;
  } catch {
    return false;
  }
}

export function canDeleteProject(user: SessionUser): boolean {
  try {
    isUserActive(user);
    return user.role === 'ADMIN';
  } catch {
    return false;
  }
}

export function assertCanViewProjects(user: SessionUser) {
  isUserActive(user);
}

export function assertCanCreateProject(user: SessionUser) {
  if (!canCreateProject(user)) {
    throw new AuthorizationError('Bạn không có quyền tạo dự án.');
  }
}

export function assertCanManageProject(
  user: SessionUser,
  project: { managerId: string }
) {
  if (!canManageProject(user, project)) {
    throw new AuthorizationError('Bạn không có quyền quản lý dự án này.');
  }
}

export function assertCanDeleteProject(user: SessionUser) {
  if (!canDeleteProject(user)) {
    throw new AuthorizationError('Chỉ có ADMIN mới được phép xóa dự án.');
  }
}
