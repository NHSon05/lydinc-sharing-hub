import { db } from '@/lib/db';
import type { Prisma, ProjectMemberRole } from '@/generated/prisma/client';

type DbClient = typeof db | Prisma.TransactionClient;

export async function findProjectMembers(
  projectId: string,
  query: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: ProjectMemberRole;
  },
  tx?: DbClient
) {
  const client = tx ?? db;
  const { page = 1, pageSize = 20, search, role } = query;

  const where: Prisma.ProjectMemberWhereInput = {
    projectId,
    ...(role ? { role } : {}),
    ...(search
      ? {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        }
      : {}),
  };

  const skip = (page - 1) * pageSize;

  const [items, totalItems] = await Promise.all([
    client.projectMember.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { joinedAt: 'desc' },
      include: {
        user: {
          include: {
            department: true,
          },
        },
      },
    }),
    client.projectMember.count({ where }),
  ]);

  return { items, totalItems };
}

export async function findProjectMember(
  projectId: string,
  userId: string,
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
    include: {
      user: {
        include: {
          department: true,
        },
      },
    },
  });
}

export async function findProjectMemberById(memberId: string, tx?: DbClient) {
  const client = tx ?? db;
  return client.projectMember.findUnique({
    where: { id: memberId },
    include: {
      user: {
        include: {
          department: true,
        },
      },
    },
  });
}

export async function createProjectMember(
  data: { projectId: string; userId: string; role: ProjectMemberRole },
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.projectMember.create({
    data: {
      projectId: data.projectId,
      userId: data.userId,
      role: data.role,
    },
    include: {
      user: {
        include: {
          department: true,
        },
      },
    },
  });
}

export async function createManyProjectMembers(
  data: { projectId: string; userId: string; role: ProjectMemberRole }[],
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.projectMember.createMany({
    data,
    skipDuplicates: true,
  });
}

export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: ProjectMemberRole,
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.projectMember.update({
    where: {
      projectId_userId: { projectId, userId },
    },
    data: { role },
    include: {
      user: {
        include: {
          department: true,
        },
      },
    },
  });
}

export async function deleteProjectMember(
  projectId: string,
  userId: string,
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.projectMember.delete({
    where: {
      projectId_userId: { projectId, userId },
    },
  });
}

export async function countProjectManagers(projectId: string, tx?: DbClient) {
  const client = tx ?? db;
  return client.projectMember.count({
    where: {
      projectId,
      role: { in: ['OWNER', 'MANAGER'] },
    },
  });
}

export async function countAssignedTasks(
  projectId: string,
  userId: string,
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.task.count({
    where: {
      projectId,
      assigneeId: userId,
      status: { in: ['TODO', 'IN_PROGRESS', 'REVIEW'] },
    },
  });
}

export async function findMemberCandidates(
  projectId: string,
  search?: string,
  tx?: DbClient
) {
  const client = tx ?? db;
  const where: Prisma.UserWhereInput = {
    status: 'ACTIVE',
    projectMemberships: {
      none: {
        projectId,
      },
    },
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  return client.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function findProjectManagerCount(
  projectId: string,
  managerId: string,
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.projectMember.count({
    where: {
      projectId,
      userId: { not: managerId },
      role: { in: ['OWNER', 'MANAGER'] },
    },
  });
}

export async function findUserActiveTasks(
  projectId: string,
  userId: string,
  tx?: DbClient
) {
  const client = tx ?? db;
  return client.task.count({
    where: {
      projectId,
      assigneeId: userId,
      status: { in: ['TODO', 'IN_PROGRESS', 'REVIEW'] },
    },
  });
}
