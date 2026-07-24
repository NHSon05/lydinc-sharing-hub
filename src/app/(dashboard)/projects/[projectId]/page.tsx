import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getProject } from '@/modules/projects/project.service';
import { listDepartments } from '@/modules/departments/department.service';
import { ProjectDetailClient } from '@/components/projects/project-detail-client';
import type { DepartmentOption, ManagerOption, ProjectItem } from '@/components/projects/project-ui.types';

type PageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { projectId } = await params;

  let projectData = null;
  let deptsResult = null;
  let managersResult = null;

  try {
    const [fetchedProject, fetchedDepts, fetchedManagers] = await Promise.all([
      getProject({
        actor: session.user,
        id: projectId,
      }),
      listDepartments({
        actor: session.user,
        query: { page: 1, pageSize: 100 },
      }),
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

    projectData = fetchedProject;
    deptsResult = fetchedDepts;
    managersResult = fetchedManagers;
  } catch (err: unknown) {
    console.error('Project Detail Page Load Error:', err);
    notFound();
  }

  if (!projectData) {
    notFound();
  }

  const project: ProjectItem = {
    id: projectData.id,
    code: projectData.code,
    name: projectData.name,
    description: projectData.description,
    status: projectData.status,
    startDate: projectData.startDate,
    endDate: projectData.endDate,
    department: {
      id: projectData.department.id,
      name: projectData.department.name,
    },
    manager: {
      id: projectData.manager.id,
      name: projectData.manager.name,
      email: projectData.manager.email,
    },
    createdBy: {
      id: projectData.createdBy.id,
      name: projectData.createdBy.name,
    },
    taskSummary: {
      total: projectData.taskSummary.total,
      completed: projectData.taskSummary.completed,
    },
    memberCount: projectData.memberCount,
    createdAt: projectData.createdAt,
    updatedAt: projectData.updatedAt,
  };

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
    <ProjectDetailClient
      project={project}
      departments={departments}
      managers={managers}
      userId={session.user.id}
      userRole={session.user.role as 'ADMIN' | 'MANAGER' | 'MEMBER'}
    />
  );
}
