import type { NextAuthConfig } from 'next-auth';
import type { UserRole, UserStatus } from '@/generated/prisma/client';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.status = user.status;
        token.departmentId = user.departmentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string) ?? '';
        session.user.email = (token.email as string) ?? '';
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.departmentId = token.departmentId as string;
      }
      return session;
    },
  },
  providers: [],
  session: {
    strategy: 'jwt',
  },
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    'development-secret-key-lydinc-taskhub-2026',
} satisfies NextAuthConfig;
