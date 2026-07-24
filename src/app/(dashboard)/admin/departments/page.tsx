import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { listDepartments } from '@/modules/departments/department.service';
import { DepartmentPageClient } from '@/components/departments/department-page-client';
import type { DepartmentItem } from '@/components/departments/department-ui.types';

type PageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
};

export default async function AdminDepartmentsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10) || 1;
  const pageSize = parseInt(resolvedParams.pageSize || '20', 10) || 20;
  const search = resolvedParams.search || '';

  const isAdmin = session.user.role === 'ADMIN';

  // Fetch departments directly via server service
  const result = await listDepartments({
    actor: session.user,
    query: {
      page,
      pageSize,
      search: search || undefined,
      includeCounts: true,
    },
  });

  const departments: DepartmentItem[] = result.items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    _count: (item as unknown as { _count?: { users: number; projects: number } })._count,
  }));

  return (
    <DepartmentPageClient
      initialDepartments={departments}
      pagination={result.pagination}
      isAdmin={isAdmin}
      searchQuery={search}
    />
  );
}
