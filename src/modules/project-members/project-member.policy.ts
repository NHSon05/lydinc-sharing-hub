import { AuthorizationError, AccountStatusError } from '@/lib/errors';
import type { SessionUser } from '@/modules/auth/auth.types';

function assertUserActive(user: SessionUser) {
  if (user.status !== 'ACTIVE') {
    throw new AccountStatusError('Tài khoản đã bị khóa hoặc chưa kích hoạt.');
  }
}

function isManagerOrAdmin(user: SessionUser, managerId: string): boolean {
  return user.role === 'ADMIN' || (user.role === 'MANAGER' && user.id === managerId);
}

function isAdmin(user: SessionUser): boolean {
  return user.role === 'ADMIN';
}

export function canViewProjectMembers(
  user: SessionUser,
  projectContext: { managerId: string; members: { userId: string }[] }
): boolean {
  if (isAdmin(user)) return true;
  if (user.id === projectContext.managerId) return true;
  return projectContext.members.some((m) => m.userId === user.id);
}

export function canAddProjectMember(
  user: SessionUser,
  projectContext: { managerId: string }
): boolean {
  return isManagerOrAdmin(user, projectContext.managerId);
}

export function canUpdateProjectMember(
  user: SessionUser,
  projectContext: { managerId: string }
): boolean {
  return isManagerOrAdmin(user, projectContext.managerId);
}

export function canRemoveProjectMember(
  user: SessionUser,
  projectContext: { managerId: string }
): boolean {
  return isManagerOrAdmin(user, projectContext.managerId);
}

export function assertCanViewProjectMembers(
  user: SessionUser,
  projectContext: { managerId: string; members: { userId: string }[] }
) {
  assertUserActive(user);
  if (!canViewProjectMembers(user, projectContext)) {
    throw new AuthorizationError('Bạn không có quyền xem thành viên của dự án này.');
  }
}

export function assertCanAddProjectMember(
  user: SessionUser,
  projectContext: { managerId: string }
) {
  assertUserActive(user);
  if (!canAddProjectMember(user, projectContext)) {
    throw new AuthorizationError('Bạn không có quyền thêm thành viên vào dự án.');
  }
}

export function assertCanUpdateProjectMember(
  user: SessionUser,
  projectContext: { managerId: string }
) {
  assertUserActive(user);
  if (!canUpdateProjectMember(user, projectContext)) {
    throw new AuthorizationError('Bạn không có quyền chỉnh sửa vai trò thành viên.');
  }
}

export function assertCanRemoveProjectMember(
  user: SessionUser,
  projectContext: { managerId: string }
) {
  assertUserActive(user);
  if (!canRemoveProjectMember(user, projectContext)) {
    throw new AuthorizationError('Bạn không có quyền xóa thành viên khỏi dự án.');
  }
}
