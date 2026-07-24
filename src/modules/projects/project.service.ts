import { db } from '@/lib/db';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors';
import type { SessionUser } from '@/modules/auth/auth.types';
import { ProjectStatus, type Prisma } from '@/generated/prisma/client';
import {
  assertCanCreateProject,
  assertCanDeleteProject,
  assertCanManageProject,
  assertCanViewProjects,
} from './project.policy';
import {
  createProject,
  deleteProject,
  findProjectByCode,
  findProjectById,
  findProjects,
  updateProject,
  updateProjectStatus,
} from './project.repository';
import {
  createProjectSchema,
  projectListQuerySchema,
  updateProjectSchema,
  updateProjectStatusSchema,
} from './project.schema';
import { toProjectDTO, type PrismaProjectWithRelations } from './project.mapper';

export async function listProjects({
  actor,
  query,
}: {
  actor: SessionUser;
  query?: unknown;
}) {
  assertCanViewProjects(actor);
  const validQuery = projectListQuerySchema.parse(query ?? {});

  const actorConstraints =
    actor.role === 'ADMIN'
      ? {}
      : {
          isManagerOrMemberOnly: true,
          userId: actor.id,
        };

  const { items, totalItems } = await findProjects(validQuery, actorConstraints);
  const totalPages = Math.ceil(totalItems / validQuery.pageSize) || 1;

  return {
    items: items.map((item) => toProjectDTO(item as PrismaProjectWithRelations)),
    pagination: {
      page: validQuery.page,
      pageSize: validQuery.pageSize,
      totalItems,
      totalPages,
    },
  };
}

export async function getProject({
  actor,
  id,
}: {
  actor: SessionUser;
  id: string;
}) {
  assertCanViewProjects(actor);

  const project = await findProjectById(id);
  if (!project) {
    throw new NotFoundError('Dự án không tồn tại.');
  }

  // Non-admin check: must be manager or member
  if (actor.role !== 'ADMIN') {
    const isManager = project.managerId === actor.id;
    const isMember = project.members.some((m) => m.userId === actor.id);
    if (!isManager && !isMember) {
      throw new NotFoundError('Dự án không tồn tại.');
    }
  }

  return toProjectDTO(project as PrismaProjectWithRelations);
}

export async function createProjectService({
  actor,
  input,
}: {
  actor: SessionUser;
  input: unknown;
}) {
  assertCanCreateProject(actor);
  const validated = createProjectSchema.parse(input);

  // Validate department exists
  const deptExists = await db.department.findUnique({
    where: { id: validated.departmentId },
  });
  if (!deptExists) {
    throw new ValidationError('Phòng ban/bộ phận không tồn tại.');
  }

  // Validate manager exists & holds ADMIN or MANAGER role
  const manager = await db.user.findUnique({
    where: { id: validated.managerId },
  });
  if (!manager) {
    throw new ValidationError('Người quản lý dự án không tồn tại.');
  }
  if (manager.role !== 'ADMIN' && manager.role !== 'MANAGER') {
    throw new ValidationError('Người quản lý được giao phải có vai trò ADMIN hoặc MANAGER.');
  }

  // Check unique project code
  const codeExists = await findProjectByCode(validated.code);
  if (codeExists) {
    throw new ConflictError('Mã dự án đã được sử dụng.');
  }

  return db.$transaction(async (tx) => {
    // Create project
    const project = await createProject(
      {
        code: validated.code,
        name: validated.name,
        description: validated.description,
        status: validated.status,
        startDate: validated.startDate,
        endDate: validated.endDate,
        department: { connect: { id: validated.departmentId } },
        manager: { connect: { id: validated.managerId } },
        createdBy: { connect: { id: actor.id } },
        // Manager automatically becomes project member
        members: {
          create: {
            userId: validated.managerId,
          },
        },
      },
      tx
    );

    // Create Activity Log
    await tx.activityLog.create({
      data: {
        action: 'CREATE_PROJECT',
        entityType: 'PROJECT',
        entityId: project.id,
        newValue: {
          code: project.code,
          name: project.name,
          managerId: project.managerId,
          departmentId: project.departmentId,
        },
        actorId: actor.id,
      },
    });

    return toProjectDTO(project as PrismaProjectWithRelations);
  });
}

export async function updateProjectService({
  actor,
  id,
  input,
}: {
  actor: SessionUser;
  id: string;
  input: unknown;
}) {
  const project = await findProjectById(id);
  if (!project) {
    throw new NotFoundError('Dự án không tồn tại.');
  }

  assertCanManageProject(actor, project);
  const validated = updateProjectSchema.parse(input);

  // Validate date range constraints if both or either updated
  const startDate = validated.startDate ?? project.startDate;
  const endDate = validated.endDate ?? project.endDate;
  if (startDate > endDate) {
    throw new ValidationError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
  }

  if (validated.departmentId) {
    const deptExists = await db.department.findUnique({
      where: { id: validated.departmentId },
    });
    if (!deptExists) {
      throw new ValidationError('Phòng ban/bộ phận không tồn tại.');
    }
  }

  if (validated.managerId) {
    const manager = await db.user.findUnique({
      where: { id: validated.managerId },
    });
    if (!manager) {
      throw new ValidationError('Người quản lý dự án không tồn tại.');
    }
    if (manager.role !== 'ADMIN' && manager.role !== 'MANAGER') {
      throw new ValidationError('Người quản lý được giao phải có vai trò ADMIN hoặc MANAGER.');
    }
  }

  if (validated.code && validated.code.toUpperCase() !== project.code) {
    const codeExists = await findProjectByCode(validated.code);
    if (codeExists && codeExists.id !== id) {
      throw new ConflictError('Mã dự án đã được sử dụng.');
    }
  }

  return db.$transaction(async (tx) => {
    // If manager changes, we ensure new manager is in project members too
    const oldManagerId = project.managerId;
    const newManagerId = validated.managerId;

    const data: Prisma.ProjectUpdateInput = {
      ...(validated.code && { code: validated.code }),
      ...(validated.name && { name: validated.name }),
      ...(validated.description !== undefined && { description: validated.description }),
      ...(validated.startDate && { startDate: validated.startDate }),
      ...(validated.endDate && { endDate: validated.endDate }),
      ...(validated.departmentId && { department: { connect: { id: validated.departmentId } } }),
      ...(validated.managerId && { manager: { connect: { id: validated.managerId } } }),
    };

    const updated = await updateProject(id, data, tx);

    if (newManagerId && newManagerId !== oldManagerId) {
      // Ensure member relation exists for new manager
      const memberExists = await tx.projectMember.findFirst({
        where: { projectId: id, userId: newManagerId },
      });
      if (!memberExists) {
        await tx.projectMember.create({
          data: { projectId: id, userId: newManagerId },
        });
      }
    }

    // Create Activity Log
    await tx.activityLog.create({
      data: {
        action: 'UPDATE_PROJECT',
        entityType: 'PROJECT',
        entityId: id,
        oldValue: {
          code: project.code,
          name: project.name,
          managerId: project.managerId,
          departmentId: project.departmentId,
        },
        newValue: {
          code: updated.code,
          name: updated.name,
          managerId: updated.managerId,
          departmentId: updated.departmentId,
        },
        actorId: actor.id,
      },
    });

    return toProjectDTO(updated as PrismaProjectWithRelations);
  });
}

export async function changeProjectStatus({
  actor,
  id,
  input,
}: {
  actor: SessionUser;
  id: string;
  input: unknown;
}) {
  const project = await findProjectById(id);
  if (!project) {
    throw new NotFoundError('Dự án không tồn tại.');
  }

  assertCanManageProject(actor, project);
  const validated = updateProjectStatusSchema.parse(input);

  // Transition validation
  validateStatusTransition(project.status, validated.status);

  return db.$transaction(async (tx) => {
    const updated = await updateProjectStatus(id, validated.status, tx);

    await tx.activityLog.create({
      data: {
        action: 'UPDATE_PROJECT_STATUS',
        entityType: 'PROJECT',
        entityId: id,
        oldValue: { status: project.status },
        newValue: { status: updated.status },
        actorId: actor.id,
      },
    });

    return toProjectDTO(updated as PrismaProjectWithRelations);
  });
}

export async function deleteProjectService({
  actor,
  id,
}: {
  actor: SessionUser;
  id: string;
}) {
  assertCanDeleteProject(actor);

  const project = await findProjectById(id);
  if (!project) {
    throw new NotFoundError('Dự án không tồn tại.');
  }

  return db.$transaction(async (tx) => {
    await deleteProject(id, tx);

    await tx.activityLog.create({
      data: {
        action: 'DELETE_PROJECT',
        entityType: 'PROJECT',
        entityId: id,
        oldValue: {
          code: project.code,
          name: project.name,
        },
        actorId: actor.id,
      },
    });

    return {
      success: true,
      message: 'Xóa dự án thành công.',
    };
  });
}

function validateStatusTransition(current: ProjectStatus, target: ProjectStatus) {
  if (current === target) return;

  // COMPLETED/CANCELLED are terminal. Reopening is blocked for strict consistency.
  if (current === ProjectStatus.COMPLETED) {
    throw new ValidationError('Dự án đã hoàn thành không thể thay đổi trạng thái.');
  }
  if (current === ProjectStatus.CANCELLED) {
    throw new ValidationError('Dự án đã bị hủy bỏ không thể thay đổi trạng thái.');
  }
}
