import { AccountStatusError, AuthorizationError } from '@/lib/errors';
import type { SessionUser } from '@/modules/auth/auth.types';

function assertActiveUser(actor: SessionUser): void {
  if (actor.status !== 'ACTIVE') {
    throw new AccountStatusError('Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động.');
  }
}

export function canListUsers(actor: SessionUser): boolean {
  return actor.status === 'ACTIVE' && actor.role === 'ADMIN';
}

export function assertCanListUsers(actor: SessionUser): void {
  assertActiveUser(actor);
  if (actor.role !== 'ADMIN') {
    throw new AuthorizationError('Chỉ quản trị viên mới có quyền xem danh sách người dùng.');
  }
}

export function canCreateUser(actor: SessionUser): boolean {
  return actor.status === 'ACTIVE' && actor.role === 'ADMIN';
}

export function assertCanCreateUser(actor: SessionUser): void {
  assertActiveUser(actor);
  if (actor.role !== 'ADMIN') {
    throw new AuthorizationError('Chỉ quản trị viên mới có quyền tạo người dùng mới.');
  }
}

export function canViewUser(actor: SessionUser, targetUserId: string): boolean {
  if (actor.status !== 'ACTIVE') return false;
  return actor.role === 'ADMIN' || actor.id === targetUserId;
}

export function assertCanViewUser(actor: SessionUser, targetUserId: string): void {
  assertActiveUser(actor);
  if (actor.role !== 'ADMIN' && actor.id !== targetUserId) {
    throw new AuthorizationError('Bạn không có quyền xem thông tin người dùng này.');
  }
}

export function canUpdateUser(actor: SessionUser): boolean {
  return actor.status === 'ACTIVE' && actor.role === 'ADMIN';
}

export function assertCanUpdateUser(actor: SessionUser): void {
  assertActiveUser(actor);
  if (actor.role !== 'ADMIN') {
    throw new AuthorizationError('Chỉ quản trị viên mới có quyền cập nhật thông tin người dùng.');
  }
}

export function canChangeUserStatus(actor: SessionUser): boolean {
  return actor.status === 'ACTIVE' && actor.role === 'ADMIN';
}

export function assertCanChangeUserStatus(actor: SessionUser): void {
  assertActiveUser(actor);
  if (actor.role !== 'ADMIN') {
    throw new AuthorizationError('Chỉ quản trị viên mới có quyền thay đổi trạng thái tài khoản.');
  }
}

export function canResetUserPassword(actor: SessionUser): boolean {
  return actor.status === 'ACTIVE' && actor.role === 'ADMIN';
}

export function assertCanResetUserPassword(actor: SessionUser): void {
  assertActiveUser(actor);
  if (actor.role !== 'ADMIN') {
    throw new AuthorizationError('Chỉ quản trị viên mới có quyền đặt lại mật khẩu người dùng.');
  }
}

export function canChangeOwnPassword(actor: SessionUser, targetUserId: string): boolean {
  return actor.status === 'ACTIVE' && actor.id === targetUserId;
}

export function assertCanChangeOwnPassword(actor: SessionUser, targetUserId: string): void {
  assertActiveUser(actor);
  if (actor.id !== targetUserId) {
    throw new AuthorizationError('Bạn chỉ có thể đổi mật khẩu của chính mình.');
  }
}
