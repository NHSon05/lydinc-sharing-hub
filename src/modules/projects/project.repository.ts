import { db } from '@/lib/db';
import type { Prisma, ProjectStatus } from '@/generated/prisma/client';
import type { ProjectListQueryInput } from './project.types';

type DbClient = typeof db | Prisma.TransactionClient;

export async function findProjects(
  query: ProjectListQueryInput,
  actorConstraints?: {
    isManagerOrMemberOnly?: boolean;
    userId?: string;
  },
  tx?: DbClient
) {
  const client = tx ?? db;
  const {
    page = 1,
    pageSize = 20,
    search,
    status,
    departmentId,
    managerId,
    startFrom,
    startTo,
    endFrom,
    endTo,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const where: Prisma.ProjectWhereInput = {
    AND: [
      // Search filter
      search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      // Exact filters
      status ? { status } : {},
      departmentId ? { departmentId } : {},
      managerId ? { managerId } : {},
      // Date range filters
      startFrom || startTo
        ? {
            startDate: {
              ...(startFrom && { gte: startFrom }),
              ...(startTo && { lte: startTo }),
            },
          }
        : {},
      endFrom || endTo
        ? {
            endDate: {
              ...(endFrom && { gte: endFrom }),
              ...(endTo && { lte: endTo }),
            },
          }
        : {},
      // Role scope authorization filters
      actorConstraints?.isManagerOrMemberOnly && actorConstraints.userId
        ? {
            OR: [
              { managerId: actorConstraints.userId },
              { members: { some: { userId: actorConstraints.userId } } },
            ],
          }
        : {},
    ],
  };

  const skip = (page - 1) * pageSize;

  const [items, totalItems] = await Promise.all([
    client.project.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        department: true,
        manager: true,
        createdBy: true,
        members: true,
        tasks: true,
      },
    }),
    client.project.count({ where }),
  ]);

  return {
    items,
    totalItems,
  };
}

export async function findProjectById(id: string, tx?: DbClient) {
  const client = tx ?? db;
  return client.project.findUnique({
    where: { id },
    include: {
      department: true,
      manager: true,
      createdBy: true,
      members: true,
      tasks: true,
    },
  });
}

export async function findProjectByCode(code: string, tx?: DbClient) {
  const client = tx ?? db;
  return client.project.findFirst({
    where: {
      code: {
        equals: code,
        mode: 'insensitive',
      },
    },
  });
}

export async function createProject(
  data: Prisma.ProjectCreateInput,
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.project.create({
    data,
    include: {
      department: true,
      manager: true,
      createdBy: true,
      members: true,
      tasks: true,
    },
  });
}

export async function updateProject(
  id: string,
  data: Prisma.ProjectUpdateInput,
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.project.update({
    where: { id },
    data,
    include: {
      department: true,
      manager: true,
      createdBy: true,
      members: true,
      tasks: true,
    },
  });
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.project.update({
    where: { id },
    data: { status },
    include: {
      department: true,
      manager: true,
      createdBy: true,
      members: true,
      tasks: true,
    },
  });
}

export async function deleteProject(id: string, tx?: DbClient) {
  const client = tx ?? db;
  return client.project.delete({
    where: { id },
  });
}

export async function countProjectMembers(projectId: string, tx?: DbClient) {
  const client = tx ?? db;
  return client.projectMember.count({
    where: { projectId },
  });
}

export async function countProjectTasks(projectId: string, tx?: DbClient) {
  const client = tx ?? db;
  return client.task.count({
    where: { projectId },
  });
}
