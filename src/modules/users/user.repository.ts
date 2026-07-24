import { db } from '@/lib/db';
import type { Prisma, UserStatus } from '@/generated/prisma/client';
import type { CreateUserInput, UserListQueryInput, UpdateUserInput } from './user.schema';

type DbClient = typeof db | Prisma.TransactionClient;

/**
 * Finds users with pagination, search, role, status, and department filtering.
 */
export async function findUsers(query: UserListQueryInput, tx?: DbClient) {
  const client = tx ?? db;
  const {
    page = 1,
    pageSize = 20,
    search,
    role,
    status,
    departmentId,
    sortBy = 'name',
    sortOrder = 'asc',
  } = query;

  const where: Prisma.UserWhereInput = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      role ? { role } : {},
      status ? { status } : {},
      departmentId ? { departmentId } : {},
    ],
  };

  const skip = (page - 1) * pageSize;

  const orderBy: Prisma.UserOrderByWithRelationInput =
    sortBy === 'createdAt' || sortBy === 'updatedAt'
      ? { [sortBy]: sortOrder }
      : sortBy === 'role' || sortBy === 'status' || sortBy === 'email'
      ? { [sortBy]: sortOrder }
      : { name: sortOrder };

  const [items, totalItems] = await Promise.all([
    client.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      include: {
        department: true,
      },
    }),
    client.user.count({ where }),
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
 * Finds a user by ID including department relation.
 */
export async function findUserById(id: string, tx?: DbClient) {
  const client = tx ?? db;

  return client.user.findUnique({
    where: { id },
    include: {
      department: true,
    },
  });
}

/**
 * Finds a user by ID including passwordHash for authentication/credential verification.
 */
export async function findUserByIdWithPassword(id: string, tx?: DbClient) {
  const client = tx ?? db;

  return client.user.findUnique({
    where: { id },
    include: {
      department: true,
    },
  });
}

/**
 * Finds a user by email (case-insensitive).
 */
export async function findUserByEmail(email: string, tx?: DbClient) {
  const client = tx ?? db;

  return client.user.findFirst({
    where: {
      email: {
        equals: email.toLowerCase(),
        mode: 'insensitive',
      },
    },
  });
}

/**
 * Finds duplicate email excluding a specific userId (for profile update).
 */
export async function findUserByEmailExcludingId(
  email: string,
  userId: string,
  tx?: DbClient,
) {
  const client = tx ?? db;

  return client.user.findFirst({
    where: {
      email: {
        equals: email.toLowerCase(),
        mode: 'insensitive',
      },
      id: {
        not: userId,
      },
    },
  });
}

/**
 * Counts total active ADMIN users in the system.
 */
export async function countActiveAdmins(tx?: DbClient): Promise<number> {
  const client = tx ?? db;

  return client.user.count({
    where: {
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
}

/**
 * Creates a new user record.
 */
export async function createUserRecord(
  data: CreateUserInput & { passwordHash: string },
  tx?: DbClient,
) {
  const client = tx ?? db;

  return client.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
      departmentId: data.departmentId,
    },
    include: {
      department: true,
    },
  });
}

/**
 * Updates an existing user record.
 */
export async function updateUserRecord(
  id: string,
  data: UpdateUserInput,
  tx?: DbClient,
) {
  const client = tx ?? db;

  return client.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email.toLowerCase() }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
    },
    include: {
      department: true,
    },
  });
}

/**
 * Updates user account status.
 */
export async function updateUserStatusRecord(
  id: string,
  status: UserStatus,
  tx?: DbClient,
) {
  const client = tx ?? db;

  return client.user.update({
    where: { id },
    data: { status },
    include: {
      department: true,
    },
  });
}

/**
 * Updates user passwordHash.
 */
export async function updateUserPasswordRecord(
  id: string,
  passwordHash: string,
  tx?: DbClient,
) {
  const client = tx ?? db;

  return client.user.update({
    where: { id },
    data: { passwordHash },
    include: {
      department: true,
    },
  });
}
