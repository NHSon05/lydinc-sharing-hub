import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { listUsers } from '@/modules/users/user.service';
import { listDepartments } from '@/modules/departments/department.service';
import { UserPageClient } from '@/components/users/user-page-client';
import type { DepartmentOption, UserItem } from '@/components/users/user-ui.types';

type PageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    role?: string;
    status?: string;
    departmentId?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Access Control: Admin only
  if (session.user.role !== 'ADMIN' || session.user.status !== 'ACTIVE') {
    redirect('/dashboard');
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10) || 1;
  const pageSize = parseInt(resolvedParams.pageSize || '20', 10) || 20;
  const search = resolvedParams.search || '';
  const role = resolvedParams.role || '';
  const status = resolvedParams.status || '';
  const departmentId = resolvedParams.departmentId || '';

  // Fetch users and departments directly via server-side service calls
  const [usersResult, deptsResult] = await Promise.all([
    listUsers({
      actor: session.user,
      query: {
        page,
        pageSize,
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        departmentId: departmentId || undefined,
      },
    }),
    listDepartments({
      actor: session.user,
      query: { page: 1, pageSize: 100 },
    }),
  ]);

  const users: UserItem[] = usersResult.items.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    departmentId: u.departmentId,
    department: {
      id: u.department.id,
      name: u.department.name,
    },
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  const departments: DepartmentOption[] = deptsResult.items.map((d) => ({
    id: d.id,
    name: d.name,
  }));

  return (
    <UserPageClient
      initialUsers={users}
      departments={departments}
      pagination={usersResult.pagination}
      isAdmin={true}
      searchQuery={search}
      roleQuery={role}
      statusQuery={status}
      deptQuery={departmentId}
    />
  );
}
