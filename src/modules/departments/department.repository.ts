import { db } from '@/lib/db';
import type { Prisma } from '@/generated/prisma/client';
import type {
  CreateDepartmentInput,
  DepartmentListQueryInput,
  UpdateDepartmentInput,
} from './department.schema';

type DbClient = typeof db | Prisma.TransactionClient;

/**
 * Finds departments with pagination, search, and optional relation counts.
 */
export async function findDepartments(
  query: DepartmentListQueryInput,
  tx?: DbClient,
) {
  const client = tx ?? db;
  const { page = 1, pageSize = 20, search, includeCounts } = query;

  const where: Prisma.DepartmentWhereInput = search
    ? {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }
    : {};

  const skip = (page - 1) * pageSize;

  const [items, totalItems] = await Promise.all([
    client.department.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'asc',
      },
      include: includeCounts
        ? {
            _count: {
              select: {
                users: true,
                projects: true,
              },
            },
          }
        : undefined,
    }),
    client.department.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return {
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

/**
 * Finds a department by ID with optional relation counts.
 */
export async function findDepartmentById(
  id: string,
  includeCounts = false,
  tx?: DbClient,
) {
  const client = tx ?? db;

  return client.department.findUnique({
    where: { id },
    include: includeCounts
      ? {
          _count: {
            select: {
              users: true,
              projects: true,
            },
          },
        }
      : undefined,
  });
}

/**
 * Finds a department by name (case-insensitive search).
 */
export async function findDepartmentByName(name: string, tx?: DbClient) {
  const client = tx ?? db;

  return client.department.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  });
}

/**
 * Creates a new department record.
 */
export async function createDepartmentRecord(
  data: CreateDepartmentInput,
  tx?: DbClient,
) {
  const client = tx ?? db;

  return client.department.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });
}

/**
 * Updates an existing department record.
 */
export async function updateDepartmentRecord(
  id: string,
  data: UpdateDepartmentInput,
  tx?: DbClient,
) {
  const client = tx ?? db;

  return client.department.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });
}

/**
 * Deletes a department record by ID.
 */
export async function deleteDepartmentRecord(id: string, tx?: DbClient) {
  const client = tx ?? db;

  return client.department.delete({
    where: { id },
  });
}

/**
 * Counts active relations (users and projects) connected to a department.
 */
export async function countDepartmentRelations(id: string, tx?: DbClient) {
  const client = tx ?? db;

  const result = await client.department.findUnique({
    where: { id },
    select: {
      _count: {
        select: {
          users: true,
          projects: true,
        },
      },
    },
  });

  return {
    userCount: result?._count.users ?? 0,
    projectCount: result?._count.projects ?? 0,
  };
}
