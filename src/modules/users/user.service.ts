import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors';
import type { SessionUser } from '@/modules/auth/auth.types';
import { findDepartmentById } from '@/modules/departments/department.repository';
import {
  assertCanChangeOwnPassword,
  assertCanChangeUserStatus,
  assertCanCreateUser,
  assertCanListUsers,
  assertCanResetUserPassword,
  assertCanUpdateUser,
  assertCanViewUser,
} from './user.policy';

import {
  countActiveAdmins,
  createUserRecord,
  findUserByEmail,
  findUserByEmailExcludingId,
  findUserById,
  findUserByIdWithPassword,
  findUsers,
  updateUserPasswordRecord,
  updateUserRecord,
  updateUserStatusRecord,
} from './user.repository';

import {
  changeOwnPasswordSchema,
  createUserSchema,
  resetUserPasswordSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userListQuerySchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UpdateUserStatusInput,
} from './user.schema';

import { toUserListItem } from './user.mapper';
import type { PaginatedUsers, UserDetail, UserListItem } from './user.types';

/**
 * Lists users with pagination, search, role, status, and department filtering.
 * Permission: ACTIVE ADMIN users only.
 */
export async function listUsers({
  actor,
  query,
}: {
  actor: SessionUser;
  query?: unknown;
}): Promise<PaginatedUsers> {
  assertCanListUsers(actor);
  const validQuery = userListQuerySchema.parse(query ?? {});

  const result = await findUsers(validQuery);

  return {
    items: result.items.map(toUserListItem),
    pagination: result.pagination,
  };
}

/**
 * Gets detailed profile of a specific user.
 * Permission: ACTIVE ADMIN or self.
 */
export async function getUserById({
  actor,
  id,
}: {
  actor: SessionUser;
  id: string;
}): Promise<UserDetail> {
  assertCanViewUser(actor, id);

  const user = await findUserById(id);
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng.');
  }

  return toUserListItem(user);
}

/**
 * Creates a new user account.
 * Rules:
 * - ACTIVE ADMIN only.
 * - Normalized unique email.
 * - Valid department.
 * - Password hashed with bcryptjs.
 * - Transaction creating user & ActivityLog.
 */
export async function createUser({
  actor,
  input,
}: {
  actor: SessionUser;
  input: unknown;
}): Promise<UserListItem> {
  assertCanCreateUser(actor);
  const validFields: CreateUserInput = createUserSchema.parse(input);

  const normalizedEmail = validFields.email.toLowerCase();

  const existingByEmail = await findUserByEmail(normalizedEmail);
  if (existingByEmail) {
    throw new ConflictError('Email này đã được sử dụng trong hệ thống.');
  }

  const department = await findDepartmentById(validFields.departmentId);
  if (!department) {
    throw new NotFoundError('Phòng ban đã chọn không còn tồn tại.');
  }

  const passwordHash = await bcrypt.hash(validFields.password, 10);

  return db.$transaction(async (tx) => {
    const user = await createUserRecord(
      {
        ...validFields,
        email: normalizedEmail,
        passwordHash,
      },
      tx,
    );

    await tx.activityLog.create({
      data: {
        action: 'USER_CREATED',
        entityType: 'USER',
        entityId: user.id,
        newValue: {
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          departmentId: user.departmentId,
        },
        actorId: actor.id,
      },
    });

    return toUserListItem(user);
  });
}

/**
 * Updates an existing user's profile details.
 * Rules:
 * - ACTIVE ADMIN only.
 * - Unique email check if email is modified.
 * - Department existence check if departmentId is modified.
 * - Prevents demoting the last active ADMIN user.
 */
export async function updateUser({
  actor,
  id,
  input,
}: {
  actor: SessionUser;
  id: string;
  input: unknown;
}): Promise<UserListItem> {
  assertCanUpdateUser(actor);
  const validFields: UpdateUserInput = updateUserSchema.parse(input);

  const existingUser = await findUserById(id);
  if (!existingUser) {
    throw new NotFoundError('Không tìm thấy người dùng.');
  }

  if (validFields.email && validFields.email.toLowerCase() !== existingUser.email.toLowerCase()) {
    const duplicate = await findUserByEmailExcludingId(validFields.email, id);
    if (duplicate) {
      throw new ConflictError('Email này đã được sử dụng bởi người dùng khác.');
    }
  }

  if (validFields.departmentId && validFields.departmentId !== existingUser.departmentId) {
    const department = await findDepartmentById(validFields.departmentId);
    if (!department) {
      throw new NotFoundError('Phòng ban đã chọn không còn tồn tại.');
    }
  }

  // Prevent demoting the last ACTIVE ADMIN
  if (
    validFields.role &&
    validFields.role !== 'ADMIN' &&
    existingUser.role === 'ADMIN' &&
    existingUser.status === 'ACTIVE'
  ) {
    const activeAdminsCount = await countActiveAdmins();
    if (activeAdminsCount <= 1) {
      throw new ConflictError(
        'Không thể thay đổi vai trò của quản trị viên đang hoạt động cuối cùng.'
      );
    }
  }

  return db.$transaction(async (tx) => {
    const updatedUser = await updateUserRecord(id, validFields, tx);

    await tx.activityLog.create({
      data: {
        action: 'USER_UPDATED',
        entityType: 'USER',
        entityId: id,
        oldValue: {
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          departmentId: existingUser.departmentId,
        },
        newValue: {
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          departmentId: updatedUser.departmentId,
        },
        actorId: actor.id,
      },
    });

    return toUserListItem(updatedUser);
  });
}

/**
 * Updates a user's account status (ACTIVE, INACTIVE, LOCKED).
 * Rules:
 * - ACTIVE ADMIN only.
 * - Prevents ADMIN from deactivating/locking their own active account.
 * - Prevents deactivating/locking the last active ADMIN user in system.
 */
export async function updateUserStatus({
  actor,
  id,
  input,
}: {
  actor: SessionUser;
  id: string;
  input: unknown;
}): Promise<UserListItem> {
  assertCanChangeUserStatus(actor);
  const validFields: UpdateUserStatusInput = updateUserStatusSchema.parse(input);

  const existingUser = await findUserById(id);
  if (!existingUser) {
    throw new NotFoundError('Không tìm thấy người dùng.');
  }

  // Prevent ADMIN from disabling current logged in user account
  if (actor.id === id && validFields.status !== 'ACTIVE') {
    throw new ConflictError(
      'Bạn không thể tự khóa hoặc vô hiệu hóa tài khoản của chính mình.'
    );
  }

  // Prevent disabling/locking the last active ADMIN
  if (
    existingUser.role === 'ADMIN' &&
    existingUser.status === 'ACTIVE' &&
    validFields.status !== 'ACTIVE'
  ) {
    const activeAdminsCount = await countActiveAdmins();
    if (activeAdminsCount <= 1) {
      throw new ConflictError(
        'Không thể khóa hoặc vô hiệu hóa quản trị viên đang hoạt động cuối cùng của hệ thống.'
      );
    }
  }

  return db.$transaction(async (tx) => {
    const updatedUser = await updateUserStatusRecord(id, validFields.status, tx);

    await tx.activityLog.create({
      data: {
        action: 'USER_STATUS_CHANGED',
        entityType: 'USER',
        entityId: id,
        oldValue: { status: existingUser.status },
        newValue: { status: updatedUser.status },
        actorId: actor.id,
      },
    });

    return toUserListItem(updatedUser);
  });
}

/**
 * Self password change for authenticated users.
 */
export async function changeOwnPassword({
  actor,
  id,
  input,
}: {
  actor: SessionUser;
  id: string;
  input: unknown;
}) {
  assertCanChangeOwnPassword(actor, id);
  const validFields = changeOwnPasswordSchema.parse(input);

  const user = await findUserByIdWithPassword(id);
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng.');
  }

  const isValidCurrent = await bcrypt.compare(validFields.currentPassword, user.passwordHash);
  if (!isValidCurrent) {
    throw new ValidationError('Mật khẩu hiện tại không chính xác.');
  }

  const newHash = await bcrypt.hash(validFields.newPassword, 10);

  return db.$transaction(async (tx) => {
    await updateUserPasswordRecord(id, newHash, tx);

    await tx.activityLog.create({
      data: {
        action: 'USER_PASSWORD_CHANGED',
        entityType: 'USER',
        entityId: id,
        actorId: actor.id,
      },
    });

    return {
      success: true,
      message: 'Đổi mật khẩu thành công.',
    };
  });
}

/**
 * ADMIN password reset for target user.
 */
export async function resetUserPassword({
  actor,
  id,
  input,
}: {
  actor: SessionUser;
  id: string;
  input: unknown;
}) {
  assertCanResetUserPassword(actor);
  const validFields = resetUserPasswordSchema.parse(input);

  const existingUser = await findUserById(id);
  if (!existingUser) {
    throw new NotFoundError('Không tìm thấy người dùng.');
  }

  const newHash = await bcrypt.hash(validFields.newPassword, 10);

  return db.$transaction(async (tx) => {
    await updateUserPasswordRecord(id, newHash, tx);

    await tx.activityLog.create({
      data: {
        action: 'USER_PASSWORD_RESET',
        entityType: 'USER',
        entityId: id,
        actorId: actor.id,
      },
    });

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công.',
    };
  });
}
