import { db } from '@/lib/db';
import { NotFoundError, ValidationError, AuthorizationError } from '@/lib/errors';
import type { SessionUser } from '@/modules/auth/auth.types';
import { TaskStatus, type Prisma } from '@/generated/prisma/client';
import {
  assertCanCreateTask,
  assertCanDeleteTask,
  assertCanChangeTaskAssignee,
  assertCanUpdateTask,
  assertCanViewTask,
  isUserActive,
} from './task.policy';
import {
  createTaskRecord,
  deleteTaskRecord,
  findTaskById,
  findTasks,
  updateTaskRecord,
} from './task.repository';
import {
  createTaskSchema,
  taskListQuerySchema,
  updateTaskSchema,
  changeTaskStatusSchema,
  changeTaskAssigneeSchema,
} from './task.schema';
import { toTaskDTO, type PrismaTaskWithRelations } from './task.mapper';

export async function listTasks({
  actor,
  query,
}: {
  actor: SessionUser;
  query?: unknown;
}) {
  isUserActive(actor);
  const validQuery = taskListQuerySchema.parse(query ?? {});

  const actorConstraints =
    actor.role === 'ADMIN'
      ? {}
      : {
          isMemberOnly: true,
          userId: actor.id,
        };

  const { items, totalItems } = await findTasks(validQuery, actorConstraints);
  const totalPages = Math.ceil(totalItems / validQuery.pageSize) || 1;

  return {
    items: items.map((item) => toTaskDTO(item as PrismaTaskWithRelations)),
    pagination: {
      page: validQuery.page,
      pageSize: validQuery.pageSize,
      totalItems,
      totalPages,
    },
  };
}

export async function getTask({
  actor,
  id,
}: {
  actor: SessionUser;
  id: string;
}) {
  const task = await findTaskById(id);
  if (!task) {
    throw new NotFoundError('Nhiệm vụ không tồn tại.');
  }

  assertCanViewTask(actor, task.project);

  return toTaskDTO(task as PrismaTaskWithRelations);
}

export async function createTask({
  actor,
  input,
}: {
  actor: SessionUser;
  input: unknown;
}) {
  isUserActive(actor);
  const validated = createTaskSchema.parse(input);

  // Load project context
  const project = await db.project.findUnique({
    where: { id: validated.projectId },
    include: {
      members: true,
    },
  });
  if (!project) {
    throw new NotFoundError('Dự án không tồn tại.');
  }

  // Validate authorization
  assertCanCreateTask(actor, project);

  // Check project is not cancelled or completed
  if (project.status === 'CANCELLED' || project.status === 'COMPLETED') {
    throw new ValidationError('Dự án đã đóng hoặc bị hủy bỏ, không thể tạo thêm nhiệm vụ.');
  }

  // Validate assignee exists & is active
  const assigneeUser = await db.user.findUnique({
    where: { id: validated.assigneeId },
  });
  if (!assigneeUser) {
    throw new ValidationError('Người phụ trách nhiệm vụ không tồn tại.');
  }
  if (assigneeUser.status !== 'ACTIVE') {
    throw new ValidationError('Người phụ trách không ở trạng thái hoạt động.');
  }

  // Validate assignee belongs to the project
  const isMember =
    project.managerId === validated.assigneeId ||
    project.members.some((m) => m.userId === validated.assigneeId);
  if (!isMember) {
    throw new ValidationError('Người phụ trách phải là thành viên thuộc dự án này.');
  }

  // Validate task dueDate range is within project bounds
  if (validated.dueDate > project.endDate) {
    throw new ValidationError('Hạn hoàn thành nhiệm vụ không được vượt quá ngày kết thúc của dự án.');
  }

  return db.$transaction(async (tx) => {
    const task = await createTaskRecord(
      {
        title: validated.title,
        description: validated.description,
        status: TaskStatus.TODO,
        priority: validated.priority,
        startDate: validated.startDate,
        dueDate: validated.dueDate,
        project: { connect: { id: validated.projectId } },
        assignee: { connect: { id: validated.assigneeId } },
        createdBy: { connect: { id: actor.id } },
      },
      tx
    );

    await tx.activityLog.create({
      data: {
        action: 'TASK_CREATED',
        entityType: 'TASK',
        entityId: task.id,
        newValue: {
          title: task.title,
          assigneeId: task.assigneeId,
          projectId: task.projectId,
        },
        actorId: actor.id,
      },
    });

    return toTaskDTO(task as PrismaTaskWithRelations);
  });
}

export async function updateTask({
  actor,
  id,
  input,
}: {
  actor: SessionUser;
  id: string;
  input: unknown;
}) {
  const task = await findTaskById(id);
  if (!task) {
    throw new NotFoundError('Nhiệm vụ không tồn tại.');
  }

  assertCanUpdateTask(actor, task.project, task.assigneeId);
  const validated = updateTaskSchema.parse(input);

  // Validate date range constraints if both or either updated
  const startDate = validated.startDate !== undefined ? validated.startDate : task.startDate;
  const dueDate = validated.dueDate !== undefined ? validated.dueDate : task.dueDate;
  if (startDate && dueDate && startDate > dueDate) {
    throw new ValidationError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
  }

  if (dueDate && dueDate > task.project.endDate) {
    throw new ValidationError('Hạn hoàn thành nhiệm vụ không được vượt quá ngày kết thúc của dự án.');
  }

  // Assignee role block: Members can only update progress & result
  if (actor.role === 'MEMBER') {
    const allowedKeys = ['progress', 'result'];
    const inputKeys = Object.keys(validated);
    const hasForbiddenKeys = inputKeys.some((k) => !allowedKeys.includes(k));
    if (hasForbiddenKeys) {
      throw new ValidationError('Thành viên chỉ được cập nhật tiến độ (progress) hoặc kết quả (result).');
    }
  }

  return db.$transaction(async (tx) => {
    const data: Prisma.TaskUpdateInput = {
      ...(validated.title && { title: validated.title }),
      ...(validated.description !== undefined && { description: validated.description }),
      ...(validated.priority && { priority: validated.priority }),
      ...(validated.startDate !== undefined && { startDate: validated.startDate }),
      ...(validated.dueDate && { dueDate: validated.dueDate }),
      ...(validated.progress !== undefined && { progress: validated.progress }),
      ...(validated.result !== undefined && { result: validated.result }),
    };

    const updated = await updateTaskRecord(id, data, tx);

    await tx.activityLog.create({
      data: {
        action: 'TASK_UPDATED',
        entityType: 'TASK',
        entityId: id,
        oldValue: {
          title: task.title,
          progress: task.progress,
          priority: task.priority,
        },
        newValue: {
          title: updated.title,
          progress: updated.progress,
          priority: updated.priority,
        },
        actorId: actor.id,
      },
    });

    return toTaskDTO(updated as PrismaTaskWithRelations);
  });
}

export async function changeTaskStatus({
  actor,
  id,
  input,
}: {
  actor: SessionUser;
  id: string;
  input: unknown;
}) {
  const task = await findTaskById(id);
  if (!task) {
    throw new NotFoundError('Nhiệm vụ không tồn tại.');
  }

  const validated = changeTaskStatusSchema.parse(input);
  const targetStatus = validated.status;

  // Validate permission & transitions
  validateStatusTransition(actor, task, targetStatus);

  return db.$transaction(async (tx) => {
    const completedAt = targetStatus === TaskStatus.COMPLETED ? new Date() : null;
    const progress = targetStatus === TaskStatus.COMPLETED ? 100 : task.progress;

    const data: Prisma.TaskUpdateInput = {
      status: targetStatus,
      completedAt,
      progress,
    };

    const updated = await updateTaskRecord(id, data, tx);

    await tx.activityLog.create({
      data: {
        action: 'TASK_STATUS_CHANGED',
        entityType: 'TASK',
        entityId: id,
        oldValue: { status: task.status, progress: task.progress },
        newValue: { status: updated.status, progress: updated.progress },
        actorId: actor.id,
      },
    });

    return toTaskDTO(updated as PrismaTaskWithRelations);
  });
}

export async function changeTaskAssignee({
  actor,
  id,
  input,
}: {
  actor: SessionUser;
  id: string;
  input: unknown;
}) {
  const task = await findTaskById(id);
  if (!task) {
    throw new NotFoundError('Nhiệm vụ không tồn tại.');
  }

  assertCanChangeTaskAssignee(actor, task.project);
  const validated = changeTaskAssigneeSchema.parse(input);

  // Validate assignee exists & is active
  const assigneeUser = await db.user.findUnique({
    where: { id: validated.assigneeId },
  });
  if (!assigneeUser) {
    throw new ValidationError('Người phụ trách nhiệm vụ không tồn tại.');
  }
  if (assigneeUser.status !== 'ACTIVE') {
    throw new ValidationError('Người phụ trách không ở trạng thái hoạt động.');
  }

  // Validate assignee belongs to project
  const isMember =
    task.project.managerId === validated.assigneeId ||
    task.project.members.some((m) => m.userId === validated.assigneeId);
  if (!isMember) {
    throw new ValidationError('Người phụ trách phải là thành viên thuộc dự án này.');
  }

  return db.$transaction(async (tx) => {
    const data: Prisma.TaskUpdateInput = {
      assignee: { connect: { id: validated.assigneeId } },
    };

    const updated = await updateTaskRecord(id, data, tx);

    await tx.activityLog.create({
      data: {
        action: 'TASK_ASSIGNEE_CHANGED',
        entityType: 'TASK',
        entityId: id,
        oldValue: { assigneeId: task.assigneeId },
        newValue: { assigneeId: updated.assigneeId },
        actorId: actor.id,
      },
    });

    return toTaskDTO(updated as PrismaTaskWithRelations);
  });
}

export async function deleteTask({
  actor,
  id,
}: {
  actor: SessionUser;
  id: string;
}) {
  const task = await findTaskById(id);
  if (!task) {
    throw new NotFoundError('Nhiệm vụ không tồn tại.');
  }

  assertCanDeleteTask(actor, task.project);

  return db.$transaction(async (tx) => {
    await deleteTaskRecord(id, tx);

    await tx.activityLog.create({
      data: {
        action: 'TASK_DELETED',
        entityType: 'TASK',
        entityId: id,
        oldValue: {
          title: task.title,
        },
        actorId: actor.id,
      },
    });

    return {
      success: true,
      message: 'Xóa nhiệm vụ thành công.',
    };
  });
}

function validateStatusTransition(
  actor: SessionUser,
  task: { status: TaskStatus; assigneeId: string; project: { managerId: string } },
  target: TaskStatus
) {
  const current = task.status;
  if (current === target) return;

  // Authorization checks
  const isProjectManager = task.project.managerId === actor.id;
  const isAssignee = task.assigneeId === actor.id;
  const isAuthorized = actor.role === 'ADMIN' || isProjectManager || isAssignee;

  if (!isAuthorized) {
    throw new AuthorizationError('Bạn không có quyền chuyển trạng thái nhiệm vụ này.');
  }

  // MEMBER cannot directly move to COMPLETED
  if (target === TaskStatus.COMPLETED && actor.role !== 'ADMIN' && !isProjectManager) {
    throw new AuthorizationError('Chỉ có ADMIN hoặc quản lý dự án mới được xác nhận hoàn thành.');
  }

  // Transitions rules
  const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    TODO: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    IN_PROGRESS: [TaskStatus.TODO, TaskStatus.REVIEW, TaskStatus.COMPLETED, TaskStatus.CANCELLED],
    REVIEW: [TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.CANCELLED],
    COMPLETED: [TaskStatus.IN_PROGRESS], // allow reopening
    CANCELLED: [TaskStatus.TODO], // allow restoring
  };

  if (!allowedTransitions[current].includes(target)) {
    throw new ValidationError(
      `Không thể chuyển trạng thái nhiệm vụ từ ${current} sang ${target}.`
    );
  }
}
