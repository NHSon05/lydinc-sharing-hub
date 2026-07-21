import { db } from '@/lib/db';
import { ConflictError, NotFoundError } from '@/lib/errors';
import type { SessionUser } from '@/modules/auth/auth.types';
import {
  assertCanManageDepartments,
  assertCanViewDepartments,
} from './department.policy';
import {
  countDepartmentRelations,
  createDepartmentRecord,
  deleteDepartmentRecord,
  findDepartmentById,
  findDepartmentByName,
  findDepartments,
  updateDepartmentRecord,
} from './department.repository';
import {
  createDepartmentSchema,
  departmentListQuerySchema,
  updateDepartmentSchema,
  type CreateDepartmentInput,
  type DepartmentListQueryInput,
  type UpdateDepartmentInput,
} from './department.schema';

/**
 * Lists departments with pagination, search, and optional relation counts.
 * Permission: Any ACTIVE authenticated user.
 */
export async function listDepartments({
  actor,
  query,
}: {
  actor: SessionUser;
  query?: unknown;
}) {
  assertCanViewDepartments(actor);
  const validQuery: DepartmentListQueryInput = departmentListQuerySchema.parse(
    query ?? {}
  );

  return findDepartments(validQuery);
}

/**
 * Gets a specific department by ID.
 * Permission: Any ACTIVE authenticated user.
 */
export async function getDepartment({
  actor,
  id,
  includeCounts = false,
}: {
  actor: SessionUser;
  id: string;
  includeCounts?: boolean;
}) {
  assertCanViewDepartments(actor);

  const department = await findDepartmentById(id, includeCounts);
  if (!department) {
    throw new NotFoundError('Không tìm thấy phòng ban.');
  }

  return department;
}

/**
 * Creates a new department.
 * Business Rules:
 * - Only ACTIVE ADMIN can create.
 * - Department name must be unique.
 * - Runs in a database transaction with ActivityLog creation.
 */
export async function createDepartment({
  actor,
  input,
}: {
  actor: SessionUser;
  input: unknown;
}) {
  assertCanManageDepartments(actor);
  const validFields: CreateDepartmentInput = createDepartmentSchema.parse(input);

  const existingByName = await findDepartmentByName(validFields.name);
  if (existingByName) {
    throw new ConflictError('Tên phòng ban đã tồn tại trong hệ thống.');
  }

  return db.$transaction(async (tx) => {
    const department = await createDepartmentRecord(validFields, tx);

    await tx.activityLog.create({
      data: {
        action: 'CREATE_DEPARTMENT',
        entityType: 'DEPARTMENT',
        entityId: department.id,
        newValue: {
          name: department.name,
          description: department.description,
        },
        actorId: actor.id,
      },
    });

    return department;
  });
}

/**
 * Updates an existing department.
 * Business Rules:
 * - Only ACTIVE ADMIN can update.
 * - Department must exist.
 * - New name cannot conflict with another department.
 * - Runs in a database transaction with ActivityLog creation.
 */
export async function updateDepartment({
  actor,
  id,
  input,
}: {
  actor: SessionUser;
  id: string;
  input: unknown;
}) {
  assertCanManageDepartments(actor);
  const validFields: UpdateDepartmentInput = updateDepartmentSchema.parse(input);

  const existingDepartment = await findDepartmentById(id);
  if (!existingDepartment) {
    throw new NotFoundError('Không tìm thấy phòng ban.');
  }

  if (validFields.name && validFields.name !== existingDepartment.name) {
    const duplicateDepartment = await findDepartmentByName(validFields.name);
    if (duplicateDepartment && duplicateDepartment.id !== id) {
      throw new ConflictError('Tên phòng ban mới đã tồn tại trong hệ thống.');
    }
  }

  return db.$transaction(async (tx) => {
    const updatedDepartment = await updateDepartmentRecord(id, validFields, tx);

    await tx.activityLog.create({
      data: {
        action: 'UPDATE_DEPARTMENT',
        entityType: 'DEPARTMENT',
        entityId: id,
        oldValue: {
          name: existingDepartment.name,
          description: existingDepartment.description,
        },
        newValue: {
          name: updatedDepartment.name,
          description: updatedDepartment.description,
        },
        actorId: actor.id,
      },
    });

    return updatedDepartment;
  });
}

/**
 * Deletes a department.
 * Business Rules:
 * - Only ACTIVE ADMIN can delete.
 * - Department must exist.
 * - Cannot delete if department has users or projects (HTTP 409 Conflict).
 * - Runs in a database transaction with ActivityLog creation.
 */
export async function deleteDepartment({
  actor,
  id,
}: {
  actor: SessionUser;
  id: string;
}) {
  assertCanManageDepartments(actor);

  const existingDepartment = await findDepartmentById(id);
  if (!existingDepartment) {
    throw new NotFoundError('Không tìm thấy phòng ban.');
  }

  const { userCount, projectCount } = await countDepartmentRelations(id);
  if (userCount > 0 || projectCount > 0) {
    throw new ConflictError(
      'Không thể xóa phòng ban đang có người dùng hoặc dự án.'
    );
  }

  return db.$transaction(async (tx) => {
    await deleteDepartmentRecord(id, tx);

    await tx.activityLog.create({
      data: {
        action: 'DELETE_DEPARTMENT',
        entityType: 'DEPARTMENT',
        entityId: id,
        oldValue: {
          name: existingDepartment.name,
          description: existingDepartment.description,
        },
        actorId: actor.id,
      },
    });

    return {
      success: true,
      message: 'Xóa phòng ban thành công.',
    };
  });
}
