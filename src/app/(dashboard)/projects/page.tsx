import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { listProjects } from '@/modules/projects/project.service';
import { listDepartments } from '@/modules/departments/department.service';
import { ProjectPageClient } from '@/components/projects/project-page-client';
import type { DepartmentOption, ManagerOption, ProjectItem } from '@/components/projects/project-ui.types';

type PageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
    departmentId?: string;
    managerId?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10) || 1;
  const pageSize = parseInt(resolvedParams.pageSize || '20', 10) || 20;
  const search = resolvedParams.search || '';
  const status = resolvedParams.status || '';
  const departmentId = resolvedParams.departmentId || '';
  const managerId = resolvedParams.managerId || '';

  // Get active user's details
  const userId = session.user.id;
  const userRole = session.user.role as 'ADMIN' | 'MANAGER' | 'MEMBER';

  // Fetch initial paginated projects
  const [projectsResult, deptsResult, managersResult] = await Promise.all([
    listProjects({
      actor: session.user,
      query: {
        page,
        pageSize,
        search: search || undefined,
        status: status || undefined,
        departmentId: departmentId || undefined,
        managerId: managerId || undefined,
      },
    }),
    listDepartments({
      actor: session.user,
      query: { page: 1, pageSize: 100 },
    }),
    // Fetch users that can be selected as manager (ADMIN or MANAGER)
    db.user.findMany({
      where: {
        role: { in: ['ADMIN', 'MANAGER'] },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const projects: ProjectItem[] = projectsResult.items.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    status: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
    department: {
      id: p.department.id,
      name: p.department.name,
    },
    manager: {
      id: p.manager.id,
      name: p.manager.name,
      email: p.manager.email,
    },
    createdBy: {
      id: p.createdBy.id,
      name: p.createdBy.name,
    },
    taskSummary: {
      total: p.taskSummary.total,
      completed: p.taskSummary.completed,
    },
    memberCount: p.memberCount,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  const departments: DepartmentOption[] = deptsResult.items.map((d) => ({
    id: d.id,
    name: d.name,
  }));

  const managers: ManagerOption[] = managersResult.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role as 'ADMIN' | 'MANAGER' | 'MEMBER',
  }));

  return (
    <ProjectPageClient
      initialProjects={projects}
      departments={departments}
      managers={managers}
      pagination={projectsResult.pagination}
      userId={userId}
      userRole={userRole}
      searchQuery={search}
      statusQuery={status}
      deptQuery={departmentId}
      managerQuery={managerId}
    />
  );
}
