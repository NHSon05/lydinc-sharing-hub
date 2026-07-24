import { AccountStatusError, AuthorizationError } from '@/lib/errors';
import type { SessionUser } from '@/modules/auth/auth.types';

export function isUserActive(user: SessionUser) {
  if (user.status !== 'ACTIVE') {
    throw new AccountStatusError('Tài khoản đã bị khóa hoặc chưa kích hoạt.');
  }
}

export function canViewTask(
  user: SessionUser,
  projectContext: { managerId: string; members: { userId: string }[] }
): boolean {
  isUserActive(user);
  if (user.role === 'ADMIN') return true;
  if (user.role === 'MANAGER' && projectContext.managerId === user.id) return true;
  return projectContext.members.some((m) => m.userId === user.id);
}

export function canCreateTask(
  user: SessionUser,
  projectContext: { managerId: string }
): boolean {
  isUserActive(user);
  if (user.role === 'ADMIN') return true;
  return user.role === 'MANAGER' && projectContext.managerId === user.id;
}

export function canUpdateTask(
  user: SessionUser,
  projectContext: { managerId: string },
  taskAssigneeId: string
): boolean {
  isUserActive(user);
  if (user.role === 'ADMIN') return true;
  if (user.role === 'MANAGER' && projectContext.managerId === user.id) return true;
  return taskAssigneeId === user.id;
}

export function canChangeTaskAssignee(
  user: SessionUser,
  projectContext: { managerId: string }
): boolean {
  isUserActive(user);
  if (user.role === 'ADMIN') return true;
  return user.role === 'MANAGER' && projectContext.managerId === user.id;
}

export function canDeleteTask(
  user: SessionUser,
  projectContext: { managerId: string }
): boolean {
  isUserActive(user);
  if (user.role === 'ADMIN') return true;
  return user.role === 'MANAGER' && projectContext.managerId === user.id;
}

export function assertCanViewTask(
  user: SessionUser,
  projectContext: { managerId: string; members: { userId: string }[] }
) {
  if (!canViewTask(user, projectContext)) {
    throw new AuthorizationError('Bạn không thuộc dự án chứa nhiệm vụ này.');
  }
}

export function assertCanCreateTask(
  user: SessionUser,
  projectContext: { managerId: string }
) {
  if (!canCreateTask(user, projectContext)) {
    throw new AuthorizationError('Chỉ có ADMIN hoặc quản lý dự án mới được tạo nhiệm vụ.');
  }
}

export function assertCanUpdateTask(
  user: SessionUser,
  projectContext: { managerId: string },
  taskAssigneeId: string
) {
  if (!canUpdateTask(user, projectContext, taskAssigneeId)) {
    throw new AuthorizationError('Bạn không có quyền chỉnh sửa nhiệm vụ này.');
  }
}

export function assertCanChangeTaskAssignee(
  user: SessionUser,
  projectContext: { managerId: string }
) {
  if (!canChangeTaskAssignee(user, projectContext)) {
    throw new AuthorizationError('Chỉ có ADMIN hoặc quản lý dự án mới được giao việc.');
  }
}

export function assertCanDeleteTask(
  user: SessionUser,
  projectContext: { managerId: string }
) {
  if (!canDeleteTask(user, projectContext)) {
    throw new AuthorizationError('Chỉ có ADMIN hoặc quản lý dự án mới được xóa nhiệm vụ.');
  }
}
