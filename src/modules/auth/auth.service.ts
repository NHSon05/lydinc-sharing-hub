import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';
import { loginSchema } from './auth.schema';
import type { AuthUser, LoginInput } from './auth.types';

/**
 * Authenticates user credentials (email & password).
 * 
 * Rules:
 * - Email is normalized & validated.
 * - Checks bcrypt password hash.
 * - Only ACTIVE status users can log in (INACTIVE & LOCKED are rejected).
 * - Never returns passwordHash or exposes detailed failure reason to client.
 */
export async function authenticateUserCredentials(
  rawInput: unknown
): Promise<AuthUser | null> {
  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return null;
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      status: true,
      departmentId: true,
    },
  });

  if (!user) {
    return null;
  }

  // Reject INACTIVE or LOCKED accounts
  if (user.status !== 'ACTIVE') {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return null;
  }

  // Return public user info without passwordHash
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    departmentId: user.departmentId,
  };
}
