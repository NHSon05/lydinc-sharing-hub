import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listTasks } from '@/modules/tasks/task.service';
import { listProjects } from '@/modules/projects/project.service';
import { TaskPageClient } from '@/components/tasks/task-page-client';
import type { TaskItem, ProjectOption } from '@/components/tasks/task-ui.types';

type PageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
    priority?: string;
    projectId?: string;
    overdue?: string;
  }>;
};

export default async function TasksPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10) || 1;
  const pageSize = parseInt(resolvedParams.pageSize || '20', 10) || 20;
  const search = resolvedParams.search || '';
  const status = resolvedParams.status || '';
  const priority = resolvedParams.priority || '';
  const projectId = resolvedParams.projectId || '';
  const overdue = resolvedParams.overdue || '';

  // Get active user context
  const userId = session.user.id;
  const userRole = session.user.role as 'ADMIN' | 'MANAGER' | 'MEMBER';

  // Fetch initial paginated tasks & projects
  const [tasksResult, projectsResult] = await Promise.all([
    listTasks({
      actor: session.user,
      query: {
        page,
        pageSize,
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        projectId: projectId || undefined,
        overdue: overdue === 'true' ? true : undefined,
      },
    }),
    listProjects({
      actor: session.user,
      query: { page: 1, pageSize: 100 },
    }),
  ]);

  const tasks: TaskItem[] = tasksResult.items.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    progress: t.progress,
    startDate: t.startDate,
    dueDate: t.dueDate,
    completedAt: t.completedAt,
    result: t.result,
    isOverdue: t.isOverdue,
    project: {
      id: t.project.id,
      code: t.project.code,
      name: t.project.name,
      managerId: (t.project as { id: string; code: string; name: string; managerId?: string }).managerId,
    },
    assignee: {
      id: t.assignee.id,
      name: t.assignee.name,
      email: t.assignee.email,
    },
    createdBy: {
      id: t.createdBy.id,
      name: t.createdBy.name,
    },
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  const projects: ProjectOption[] = projectsResult.items.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    endDate: p.endDate,
    status: p.status,
  }));

  return (
    <TaskPageClient
      initialTasks={tasks}
      projects={projects}
      pagination={tasksResult.pagination}
      userId={userId}
      userRole={userRole}
      searchQuery={search}
      statusQuery={status}
      priorityQuery={priority}
      projectIdQuery={projectId}
      overdueQuery={overdue}
    />
  );
}
