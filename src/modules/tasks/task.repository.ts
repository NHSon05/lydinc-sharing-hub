import { db } from '@/lib/db';
import type { Prisma } from '@/generated/prisma/client';
import type { TaskListQueryInput } from './task.types';

type DbClient = typeof db | Prisma.TransactionClient;

export async function findTasks(
  query: TaskListQueryInput,
  actorConstraints?: {
    isMemberOnly?: boolean;
    userId?: string;
  },
  tx?: DbClient
) {
  const client = tx ?? db;
  const {
    page = 1,
    pageSize = 20,
    search,
    projectId,
    assigneeId,
    createdById,
    status,
    priority,
    dueFrom,
    dueTo,
    overdue,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const where: Prisma.TaskWhereInput = {
    AND: [
      search ? { title: { contains: search, mode: 'insensitive' } } : {},
      projectId ? { projectId } : {},
      assigneeId ? { assigneeId } : {},
      createdById ? { createdById } : {},
      status ? { status } : {},
      priority ? { priority } : {},
      dueFrom || dueTo
        ? {
            dueDate: {
              ...(dueFrom && { gte: dueFrom }),
              ...(dueTo && { lte: dueTo }),
            },
          }
        : {},
      overdue
        ? {
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
            dueDate: { lt: new Date() },
          }
        : {},
      // Security Constraints: member must belong to the task's project
      actorConstraints?.isMemberOnly && actorConstraints.userId
        ? {
            project: {
              OR: [
                { managerId: actorConstraints.userId },
                { members: { some: { userId: actorConstraints.userId } } },
              ],
            },
          }
        : {},
    ],
  };

  const skip = (page - 1) * pageSize;

  const [items, totalItems] = await Promise.all([
    client.task.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        project: true,
        assignee: true,
        createdBy: true,
      },
    }),
    client.task.count({ where }),
  ]);

  return {
    items,
    totalItems,
  };
}

export async function findTaskById(id: string, tx?: DbClient) {
  const client = tx ?? db;
  return client.task.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          members: true,
        },
      },
      assignee: true,
      createdBy: true,
    },
  });
}

export async function createTaskRecord(
  data: Prisma.TaskCreateInput,
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.task.create({
    data,
    include: {
      project: true,
      assignee: true,
      createdBy: true,
    },
  });
}

export async function updateTaskRecord(
  id: string,
  data: Prisma.TaskUpdateInput,
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.task.update({
    where: { id },
    data,
    include: {
      project: true,
      assignee: true,
      createdBy: true,
    },
  });
}

export async function deleteTaskRecord(id: string, tx?: DbClient) {
  const client = tx ?? db;
  return client.task.delete({
    where: { id },
  });
}
